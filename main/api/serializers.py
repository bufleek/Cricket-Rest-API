import json
from dataclasses import fields

from django.forms.models import model_to_dict
from main.models import (
    Batting,
    Bowling,
    FallOfWicket,
    Fixture,
    Inning,
    Player,
    Score,
    Series,
    Squad,
    Team,
    Venue,
)
from rest_framework import serializers


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = "__all__"

    def create(self, validated_data):
        series, _ = Series.objects.get_or_create(
            **validated_data, defaults={**validated_data}
        )
        return series

    def to_internal_value(self, data):
        if isinstance(data, Series):
            return data

        if str(data).isdigit():
            return Series.objects.get(id=data)

        return super().to_internal_value(data)


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"

    def create(self, validated_data):
        team, _ = Team.objects.get_or_create(
            **validated_data, defaults={**validated_data}
        )
        return team

    def to_internal_value(self, data):
        if isinstance(data, Team):
            return data

        if str(data).isdigit():
            return Team.objects.get(id=data)

        return super().to_internal_value(data)


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = "__all__"

    def create(self, validated_data):
        venue, _ = Venue.objects.get_or_create(
            **validated_data, defaults={**validated_data}
        )
        return venue

    def to_internal_value(self, data):
        if isinstance(data, Venue):
            return data

        if str(data).isdigit():
            return Venue.objects.get(id=data)
        return super().to_internal_value(data)


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = "__all__"


class FixtureSerializer(serializers.ModelSerializer):
    team_a = TeamSerializer()
    team_b = TeamSerializer()
    venue = VenueSerializer()
    series = SeriesSerializer()

    class Meta:
        model = Fixture
        exclude = (
            "commentary_url",
            "squads_url",
            "start_time",
            "end_time",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        team_a_score = Score.objects.filter(
            fixture=instance, team=instance.team_a
        ).first()
        team_b_score = Score.objects.filter(
            fixture=instance, team=instance.team_b
        ).first()
        if not team_a_score is None:
            representation["team_a"]["score"] = model_to_dict(team_a_score)
        if not team_b_score is None:
            representation["team_b"]["score"] = model_to_dict(team_b_score)
        return representation


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"


class SquadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Squad
        fields = "__all__"


class BattingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batting
        fields = "__all__"


class BowlingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bowling
        fields = "__all__"


class FallOfWicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = FallOfWicket
        fields = "__all__"


class InningSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        scores = []
        for score in Score.objects.filter(fixture=instance.fixture).all():
            scores.append(model_to_dict(score))
        representation["batting"] = json.loads(representation.get("batting"))
        representation["bowling"] = json.loads(representation.get("bowling"))
        representation["scores"] = scores
        return representation

    class Meta:
        model = Inning
        fields = "__all__"
