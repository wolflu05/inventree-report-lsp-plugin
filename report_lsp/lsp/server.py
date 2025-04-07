import asyncio
from pathlib import Path
import jwt
import os
import sys
import json
from urllib.parse import urlparse, parse_qs
from websockets import serve, ServerConnection
import djlsp

# Patch djlsp to use custom collector
collector_path = Path(djlsp.__file__).parent.joinpath("scripts", "django-collector.py")
with open(collector_path, "r") as f:
    collector_code = f.readlines()

if not any("collect_inventree_data" in line for line in collector_code):
    # Add the custom collector to the django-collector.py
    new_lines = []
    for line in collector_code:
        new_lines.append(line)
        if "collector.collect()" in line:
            new_lines.append("    from report_lsp.custom_collector import collect_inventree_data\n")
            new_lines.append("    collect_inventree_data(collector)\n")
    with open(collector_path, "w") as f:
        f.writelines(new_lines)

    print("Successfully patched djlsp to use custom collector")


def get_secret_key():
    """Return the secret key value which will be used by django."""
    # Look for environment variable
    if secret_key := os.environ.get('INVENTREE_SECRET_KEY'):
        return secret_key

    # Look for secret key file
    if secret_key_file := os.environ.get('INVENTREE_SECRET_KEY_FILE'):
        secret_key_file = Path(secret_key_file).resolve()
    else:
        print("INVENTREE_SECRET_KEY or INVENTREE_SECRET_KEY_FILE environment variables missing")
        sys.exit(0)

    return secret_key_file.read_text().strip()


SECRET_KEY = get_secret_key()


async def ws(websocket: ServerConnection):
    # Validate the auth token
    if not websocket.request:
        return
    parsed_url = urlparse(websocket.request.path)
    query = parse_qs(parsed_url.query)
    token = query.get("token", [""])[0]
    try:
        jwt_decoded = jwt.decode(token, SECRET_KEY, issuer="urn:inventree-report-lsp", algorithms=["HS256"])
    except Exception as e:
        await websocket.close(code=3000, reason="Missing or invalid token")
        print(f"Unauthorized {websocket.id}. Connection closed. ({e.__class__.__name__})")
        return

    print(f"Client connected {websocket.id}")

    proc = await asyncio.create_subprocess_exec(
        os.getenv("INVENTREE_DJANGO_LSP_SERVER_CMD", "djlsp"),
        "--cache",
        *sys.argv[1:],
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    async def read_output():
        if not proc.stdout:
            return

        content_len = None
        while True:
            try:
                line = await proc.stdout.readline()
                if not line:
                    break
            except Exception as e:
                print("Error reading from process stdout", e)
                continue

            line = line.decode()
            if line.startswith("Content-Length: "):
                content_len = int(line.split(": ")[1])
            elif line == "\r\n" and content_len is not None:
                content = (await proc.stdout.read(content_len)).decode()
                await websocket.send(content)
                content_len = None

    async def read_error():
        if not proc.stderr:
            return

        while True:
            line = await proc.stderr.readline()
            if not line:
                break
            print("Error: ", line.decode())

    async def read_client():
        if not proc.stdin:
            return

        async for message in websocket:
            try:
                # Decode the message from the client and override the workspace folder
                decoded = json.loads(message)
                if decoded.get("method") == "initialize":
                    workspace_folder = f"file://{jwt_decoded.get('workspace')}"
                    decoded["params"]["rootPath"] = workspace_folder
                    decoded["params"]["rootUri"] = workspace_folder
                    decoded["params"]["workspaceFolders"] = [
                        {
                            "uri": workspace_folder,
                            "name": "workspace",
                        }
                    ]
            except json.JSONDecodeError:
                print("Error in JSON from client")
                continue

            message = json.dumps(decoded)
            w = f"Content-Length: {len(message)}\r\n\r\n{message}".encode()
            proc.stdin.write(w)
            await proc.stdin.drain()
            await asyncio.sleep(0.1)

    await asyncio.gather(read_output(), read_error(), read_client())

    if proc.returncode is None:
        proc.terminate()
    await proc.wait()

    print(f"Client disconnected {websocket.id}")


async def main():
    async with serve(ws, "0.0.0.0", 8765) as server:
        print("Django Template LSP Server started on ws://0.0.0.0:8765")
        await server.serve_forever()


def cli():
    asyncio.run(main())


if __name__ == "__main__":
    cli()
