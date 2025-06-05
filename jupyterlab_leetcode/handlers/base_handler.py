from jupyter_server.base.handlers import APIHandler


class BaseHandler(APIHandler):
    """Base handler for JupyterLab LeetCode extension.
    This class extends APIHandler to provide a base for other handlers.
    It can be used to define common functionality or properties for all handlers.
    """

    route = r""
