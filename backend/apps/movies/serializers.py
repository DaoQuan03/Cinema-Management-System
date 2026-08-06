# apps/movies/serializers.py
from rest_framework import serializers
from apps.movies.models import Movie, Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']

class MovieSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'director', 'cast',
            'genre', 'duration_mins', 'rating', 'poster_url',
            'release_date', 'status', 'reviews'
        ]
