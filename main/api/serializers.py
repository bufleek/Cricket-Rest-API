from rest_framework import serializers
from . import models
from django.utils.translation import gettext_lazy as _


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Series
        fields = "__all__"


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = "__all__"

    def validate_team_a(self, value):
        team_b = self.context["request"].data.get("team_b")
        if team_b == value.pk:
            raise serializers.ValidationError(
                _("Team A id cant be the same with Team B id")
            )

        return value


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Team
        fields = "__all__"
