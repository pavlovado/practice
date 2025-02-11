import sys
from argparse import ArgumentParser

from uvicorn import Config, Server

import mockpatch
from mockpatch.models import UvicornSettings


def main(argv: list[str]):
    parser: ArgumentParser = ArgumentParser(
        prog="mockpatch",
        description="MockPatch",
        epilog=f"%(prog)s {mockpatch.__version__}\n{mockpatch.__author__}",
    )

    parser.add_argument("-v", "--verbose", action="store_true", help="verbose output")
    parser.add_argument("-V", "--version", action="store_true", help="version %(prog)s")
    parser.add_argument("-P", "--port", type=int, help="port for bind uvicorn server")
    parser.add_argument("-H", "--host", type=str, help="host for bind uvicorn server")

    args = parser.parse_args(argv)

    if args.version:
        print(f"{parser.prog} {mockpatch.__version__}")
        return 0

    uvicorn_settings: dict[str, str | int] = {}

    if args.verbose:
        uvicorn_settings["log_level"] = "debug"

    if args.host:
        uvicorn_settings["host"] = args.host

    if args.port:
        uvicorn_settings["port"] = args.port

    try:
        Server(
            Config(
                "mockpatch:application",
                **UvicornSettings(**uvicorn_settings).model_dump(),
            )
        ).run()

    except Exception as err:
        return err

    except KeyboardInterrupt:
        return 0

    else:
        return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
