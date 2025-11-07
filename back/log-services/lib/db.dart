import 'dart:io';
import 'package:postgres/postgres.dart';

class Db {
  static final Db _instance = Db._internal();
  factory Db() => _instance;
  Db._internal();

  late final Connection _conn;
  bool _initialized = false;

  Future<Connection> get connection async {
    if (!_initialized) {
      await init();
    }
    return _conn;
  }

  Future<void> init() async {
    if (_initialized) return;

    final host = Platform.environment['PGHOST'] ?? 'postgres';
    final port = int.parse(Platform.environment['PGPORT'] ?? '5432');
    final user = Platform.environment['PGUSER'] ?? 'lockuser';
    final pass = Platform.environment['PGPASSWORD'] ?? 'lockpass';
    final db = Platform.environment['PGDATABASE'] ?? 'electronic_lock_logs';

    _conn = await Connection.open(
      Endpoint(host: host, port: port, database: db, username: user, password: pass),
      settings: ConnectionSettings(sslMode: SslMode.disable),
    );

    await _conn.execute(
      Sql('''
        CREATE TABLE IF NOT EXISTS logs (
          id BIGSERIAL PRIMARY KEY,
          registration_code TEXT NOT NULL,
          user_email TEXT NOT NULL,
          action TEXT NOT NULL,
          ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      '''),
    );

    _initialized = true;
  }
}

