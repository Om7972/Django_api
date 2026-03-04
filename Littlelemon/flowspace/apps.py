from django.apps import AppConfig


class FlowspaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'flowspace'
    verbose_name = 'FlowSpace AI'

    def ready(self):
        # Import signals if any exist
        pass
