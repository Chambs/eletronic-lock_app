class LogEntry {
  final String user;
  final String action;
  final String timestamp;

  LogEntry({required this.user, required this.action, required this.timestamp});

  Map<String, dynamic> toJson() => {
    'user': user,
    'action': action,
    'timestamp': timestamp,
  };
}

class LogRegister {
  final String code;
  final List<LogEntry> logs;

  LogRegister({required this.code, required this.logs});
}