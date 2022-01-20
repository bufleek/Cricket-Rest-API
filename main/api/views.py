from rest_framework import generics
from rest_framework.response import Response
from django.forms.models import model_to_dict
from . import serializers, models


class SeriesCreateListView(generics.ListCreateAPIView):
    serializer_class = serializers.SeriesSerializer
    queryset = models.Series.objects.all()


class SeriesDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.SeriesSerializer
    queryset = models.Series.objects.all()


class MatchListCreateView(generics.ListCreateAPIView):
    serializer_class = serializers.MatchSerializer
    queryset = models.Match.objects.all()

    def post(self, request, *args, **kwargs):
        # if team_a_id := request.data.get("team_a_id") and (
        #     team_b_id := request.data.get("team_b_id")
        # ):
        #     if team_a_id == team_b_id:
        #         return Response(
        #             data={"message": "Team A id and Team B id cant be the same"},
        #             status=400,
        #         )
        return super().post(request, *args, **kwargs)


class MatchDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.MatchSerializer
    queryset = models.Match.objects.all()


class TeamCreateView(generics.ListCreateAPIView):
    serializer_class = serializers.TeamSerializer
    queryset = models.Team.objects.all()

    def post(self, request, *args, **kwargs):
        if name := request.data.get("name"):
            try:
                existing_team = models.Team.objects.get(name=name)
                return Response(data=model_to_dict(existing_team), status=200)
            except:
                pass
        return super().post(request, *args, **kwargs)


class TeamDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.TeamSerializer
    queryset = models.Team.objects.all()
