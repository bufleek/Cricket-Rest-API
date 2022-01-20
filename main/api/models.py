from django.db import models


class Series(models.Model):
    title = models.CharField(max_length=255, unique=True)


class Team(models.Model):
    name = models.CharField(max_length=255, unique=True)
    image_url = models.CharField(
        max_length=255,
        default="https://images.news18.com/static_news18/pix/ibnhome/news18/default-flag.jpg",
    )


class Match(models.Model):
    team_a = models.ForeignKey(
        "Team", on_delete=models.CASCADE, null=False, blank=False
    )
    team_b = models.ForeignKey(
        "Team", on_delete=models.CASCADE, null=False, blank=False
    )
    status = models.CharField(max_length=255)
    status_note = models.CharField(max_length=255, blank=True, null=True)
    venue = models.CharField(max_length=255, blank=True, null=True)
    scorecard_url = models.CharField(max_length=255, blank=True, null=True)
    commentary_url = models.CharField(max_length=255, blank=True, null=True)
    squads_url = models.CharField(max_length=255, blank=True, null=True)
