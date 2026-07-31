from django.contrib import admin

# import Goal class from the app lvl models.py file
from .models import Goal

# Register your models here.
admin.site.register(Goal)