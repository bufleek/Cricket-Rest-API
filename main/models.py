from django.db import models

# FIXTURE_STATUSES = (
#     (0, "Scheduled"),
#     (1, "Live"),
#     (2, "Finished"),
# )


class Series(models.Model):
    title = models.CharField(max_length=255, blank=False, null=False)


class Team(models.Model):
    name = models.CharField(max_length=255, blank=False, null=False)
    logo_url = models.TextField(blank=True, null=True)


class Venue(models.Model):
    name = models.CharField(max_length=255, blank=False, null=False)


class Fixture(models.Model):
    status = models.CharField(max_length=25, blank=True, null=False)
    status_note = models.CharField(max_length=255, blank=True, null=True)
    team_a = models.ForeignKey(
        Team, models.CASCADE, related_name="team_a", blank=False, null=False
    )
    team_b = models.ForeignKey(
        Team, models.CASCADE, related_name="team_b", blank=False, null=False
    )
    series = models.ForeignKey(Series, models.CASCADE, blank=True, null=True)
    date = models.DateTimeField(blank=False, null=True)
    start_time = models.TimeField(blank=False, null=True)
    end_time = models.TimeField(blank=True, null=True)
    venue = models.ForeignKey(Venue, models.CASCADE, blank=True, null=True)
    featured = models.BooleanField(default=False, blank=False, null=False)
    scorecard_url = models.TextField(blank=True, null=True)
    commentary_url = models.TextField(blank=True, null=True)
    squads_url = models.TextField(blank=True, null=True)


class Score(models.Model):
    runrate = models.CharField(max_length=10, blank=True, null=True)
    score = models.CharField(max_length=64, blank=True, null=True)
    overs = models.CharField(max_length=64, blank=True, null=True)
    full_score = models.CharField(max_length=64, blank=True, null=True)
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)

    class Meta:
        unique_together = ("team", "fixture")


class Player(models.Model):
    name = models.CharField(max_length=64, blank=False, null=False)
    b_date = models.DateField(blank=True, null=True)
    b_place = models.CharField(max_length=64, blank=True, null=True)
    role = models.CharField(max_length=64, blank=True, null=True)
    batting_style = models.CharField(max_length=64, blank=True, null=True)
    bowling_style = models.CharField(max_length=64, blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)


class Squad(models.Model):
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)
    players = models.ManyToManyField(Player)


class Batting(models.Model):
    batsman = models.CharField(max_length=64, blank=False, null=False)
    out = models.CharField(max_length=64, blank=True, null=True)
    runs = models.CharField(max_length=6, blank=True, null=True)
    balls = models.CharField(max_length=6, blank=True, null=True)
    fours = models.CharField(max_length=6, blank=True, null=True)
    sixes = models.CharField(max_length=6, blank=True, null=True)
    strike_rate = models.FloatField(blank=True, null=True)
    active = models.BooleanField(blank=False, null=False, default=False)
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)


class Bowling(models.Model):
    bowler = models.CharField(max_length=64, blank=False, null=False)
    overs = models.CharField(max_length=6, blank=True, null=True)
    maidens = models.CharField(max_length=6, blank=True, null=True)
    runs = models.CharField(max_length=6, blank=True, null=True)
    wickets = models.CharField(max_length=6, blank=True, null=True)
    wides = models.CharField(max_length=6, blank=True, null=True)
    no_balls = models.CharField(max_length=6, blank=True, null=True)
    econs = models.CharField(max_length=6, blank=True, null=True)
    active = models.BooleanField(default=False, blank=False, null=False)
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)


class FallOfWicket(models.Model):
    fow = models.TextField(blank=False, null=False)
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)


class Inning(models.Model):
    batting = models.TextField(blank=False, null=False)
    bowling = models.TextField(blank=False, null=False)
    fall_of_wickets = models.TextField(blank=True, null=False)
    inning = models.CharField(max_length=10, blank=True, null=False)
    team = models.ForeignKey(Team, models.CASCADE, blank=False, null=False)
    fixture = models.ForeignKey(Fixture, models.CASCADE, blank=False, null=False)
