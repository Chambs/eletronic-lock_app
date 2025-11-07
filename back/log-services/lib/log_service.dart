import 'log_models.dart';
import 'db.dart';
import 'package:postgres/postgres.dart';

class LogService {
  final Db _db = Db();

  Future<void> addOrCreateLog(String code, LogEntry logMessage) async {
    final conn = await _db.connection;
    await conn.execute(
      Sql.named('INSERT INTO logs (registration_code, user_email, action, ts) VALUES (@code, @email, @action, @ts)'),
      parameters: {
        'code': code,
        'email': logMessage.user,
        'action': logMessage.action,
        'ts': logMessage.timestamp,
      },
    );
  }

  Future<List<LogEntry>> getLogsByCode(String code) async {
    final conn = await _db.connection;
    final result = await conn.execute(
      Sql.named('SELECT user_email, action, ts FROM logs WHERE registration_code=@code ORDER BY ts ASC'),
      parameters: {'code': code},
    );
    return result
        .map((r) => LogEntry(user: r[0] as String, action: r[1] as String, timestamp: r[2].toString()))
        .toList();
  }

  Future<void> resetLogsByCode(String code) async {
    final conn = await _db.connection;
    await conn.execute(Sql.named('DELETE FROM logs WHERE registration_code=@code'), parameters: {'code': code});
  }
}
