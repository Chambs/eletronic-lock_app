import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';
import 'log_models.dart';
import 'log_service.dart';

class ApiRouter {
  final LogService _logService;

  ApiRouter(this._logService);

  Router get router {
    final router = Router();

    router.get('/', (Request request) async {
      final code = request.url.queryParameters['code'];
      if (code == null || code.isEmpty) {
        return Response.badRequest(body: 'Parameter "code" is required.');
      }

      final logs = await _logService.getLogsByCode(code);
      final jsonLogs = logs.map((log) => log.toJson()).toList();

      return Response.ok(
        jsonEncode(jsonLogs),
        headers: {'Content-Type': 'application/json'},
      );
    });

    router.post('/', (Request request) async {
      final body = jsonDecode(await request.readAsString());
      final user = body['user'];
      final action = body['action'];
      final code = body['code'];

      if (user == null || action == null || code == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Fields user, action and code are required.'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      final nowUtc = DateTime.now().toUtc().toIso8601String();
      final newLog = LogEntry(user: user, action: action, timestamp: nowUtc);
      await _logService.addOrCreateLog(code, newLog);

      return Response(201,
        body: jsonEncode({'message': 'Log registered successfully.'}),
        headers: {'Content-Type': 'application/json'},
      );
    });

    // POST /join
    router.post('/join', (Request request) async {
      final body = jsonDecode(await request.readAsString());
      final user = body['user'];
      final code = body['code'];

      if (user == null || code == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Fields user and code are required.'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      // Always use server UTC time for join logs
      final nowUtc = DateTime.now().toUtc().toIso8601String();
      final newLog = LogEntry(user: user, action: "joined as a guest", timestamp: nowUtc);
      await _logService.addOrCreateLog(code, newLog);

      return Response(201,
        body: jsonEncode({'message': 'Log registered successfully.'}),
        headers: {'Content-Type': 'application/json'},
      );
    });

    // POST /reset
    router.post('/reset', (Request request) async {
      final body = jsonDecode(await request.readAsString());
      final code = body['code'];

      if (code == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Field "code" is required.'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      await _logService.resetLogsByCode(code);
      return Response.ok(
        jsonEncode({'message': 'Logs have been reset.'}),
        headers: {'Content-Type': 'application/json'},
      );
    });

    return router;
  }
}
