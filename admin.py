from django.contrib import admin
from .models import Snapshot

@admin.register(Snapshot)
class SnapshotAdmin(admin.ModelAdmin):
    list_display = ('title', 'risk_level', 'department', 'status', 'due_date', 'created_at')
    list_filter = ('risk_level', 'department', 'status')
    search_fields = ('title', 'summary', 'tags')