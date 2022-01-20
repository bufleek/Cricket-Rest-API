from django.apps import AppConfig


class MainConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "main"

    def ready(self) -> None:
        from .scrapper import Scrapper
        import asyncio

        scrapper = Scrapper()
        asyncio.run(scrapper.get_full_scorecard())
