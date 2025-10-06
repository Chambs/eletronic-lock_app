class Log {
  final String user;
  final String action;
  final DateTime timestamp;

  Log({
    required this.user,
    required this.action,
    required this.timestamp,
  });

  factory Log.fromJson(Map<String, dynamic> json) {
    return Log(
      user: json['user'] ?? 'Unknown user',
      action: json['action'] ?? 'Unknown action',
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}
