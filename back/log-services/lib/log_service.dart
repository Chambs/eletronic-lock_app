import 'log_models.dart';

class LogService {
  final List<LogRegister> _logList = [];

  void addOrCreateLog(String code, LogEntry logMessage) {
    final index = _logList.indexWhere((r) => r.code == code);

    if (index == -1) {
      _logList.add(LogRegister(code: code, logs: [logMessage]));
    } else {
      _logList[index].logs.add(logMessage);
    }
  }

  List<LogEntry> getLogsByCode(String code) {
    final register = _logList.firstWhere(
      (r) => r.code == code,
      orElse: () => LogRegister(code: '', logs: []),
    );
    return register.logs;
  }

  void resetLogsByCode(String code) {
    _logList.removeWhere((r) => r.code == code);
  }
}