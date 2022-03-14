from django.forms.models import model_to_dict
from main.models import (
    Batting,
    Bowling,
    FallOfWicket,
    Fixture,
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


class FixtureSerializer(serializers.ModelSerializer):
    team_a = TeamSerializer()
    team_b = TeamSerializer()
    venue = VenueSerializer()
    series = SeriesSerializer()

    class Meta:
        model = Fixture
        fields = "__all__"


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = "__all__"


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
