FROM python:3.13-alpine as builder
WORKDIR /app
ARG PIP_CONF="pip config list"
COPY mockpatch ./mockpatch
COPY pyproject.toml README.md ./
ENV PIP_ROOT_USER_ACTION=ignore
RUN /bin/sh -c "${PIP_CONF}" && \
    pip install --upgrade pip setuptools wheel build && \
    python -m build && \
    pip install --user ./dist/mockpatch-*.whl

FROM python:3.13-alpine
WORKDIR /app
COPY --from=builder /root/.local /root/.local
VOLUME ["/app/static"]
EXPOSE 8080/tcp
ENV PATH=/root/.local:$PATH
CMD ["python", "-u", "-m", "mockpatch", "-H", "0.0.0.0"]
