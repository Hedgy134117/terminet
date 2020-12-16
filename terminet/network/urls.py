from django.urls import path
from . import views

urlpatterns = [
    path('<int:userId>/characters/', views.CharacterList.as_view()),
    path('<int:userId>/campaignCharacters/', views.CampaignCharacterList.as_view()),
    path('<int:userId>/characters/<int:characterId>/', views.CharacterDetail.as_view()),
    path('<int:userId>/characters/<int:characterId>/boxes/', views.BoxList.as_view()),
    path('<int:userId>/characters/<int:characterId>/boxes/<int:boxId>/', views.BoxDetail.as_view()),
]