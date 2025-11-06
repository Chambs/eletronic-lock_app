import 'package:test/test.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

void main() {
  final String baseUrl = Platform.environment['LOG_SERVICE_URL'] ?? 'http://localhost:3002';
  final String apiUrl = '$baseUrl/api/logs';

  group('Log Services - E2E Tests', () {
    final String testCode = 'TEST_LOCK_${DateTime.now().millisecondsSinceEpoch}';
    final String testUser = 'test_user@example.com';

    setUp(() {
      // Limpeza pode ser feita aqui se necessário
    });

    group('Health Check', () {
      test('Deve retornar status OK', () async {
        final response = await http.get(Uri.parse('$baseUrl/api/logs/health'));

        expect(response.statusCode, 200);
        final body = jsonDecode(response.body);
        expect(body['status'], 'OK');
        expect(body['service'], 'log-service');
      });
    });

    group('POST /api/logs - Registrar Log', () {
      test('Deve registrar log com sucesso', () async {
        final logData = {
          'user': testUser,
          'action': 'opened lock',
          'code': testCode,
          'timestamp': DateTime.now().toIso8601String(),
        };

        final response = await http.post(
          Uri.parse(apiUrl),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(logData),
        );

        expect(response.statusCode, 201);
        final body = jsonDecode(response.body);
        expect(body['message'], 'Log registered successfully.');
      });

      test('Deve retornar erro 400 quando campos obrigatórios estão faltando', () async {
        final logData = {
          'user': testUser,
          // action, code e timestamp faltando
        };

        final response = await http.post(
          Uri.parse(apiUrl),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(logData),
        );

        expect(response.statusCode, 400);
        final body = jsonDecode(response.body);
        expect(body['error'], contains('required'));
      });

      test('Deve registrar múltiplos logs para o mesmo código', () async {
        final actions = ['opened lock', 'closed lock', 'opened lock'];

        for (var action in actions) {
          final logData = {
            'user': testUser,
            'action': action,
            'code': testCode,
            'timestamp': DateTime.now().toIso8601String(),
          };

          final response = await http.post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(logData),
          );

          expect(response.statusCode, 201);
        }

        // Verificar se todos os logs foram registrados
        final getResponse = await http.get(
          Uri.parse('$apiUrl?code=$testCode'),
        );

        expect(getResponse.statusCode, 200);
        final logs = jsonDecode(getResponse.body) as List;
        expect(logs.length, greaterThanOrEqualTo(actions.length));
      });
    });

    group('GET /api/logs - Listar Logs', () {
      test('Deve retornar lista de logs para código válido', () async {
        // Registrar alguns logs primeiro
        for (var i = 0; i < 3; i++) {
          final logData = {
            'user': testUser,
            'action': 'action $i',
            'code': testCode,
            'timestamp': DateTime.now().toIso8601String(),
          };

          await http.post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(logData),
          );
        }

        final response = await http.get(
          Uri.parse('$apiUrl?code=$testCode'),
        );

        expect(response.statusCode, 200);
        final logs = jsonDecode(response.body) as List;
        expect(logs.length, greaterThanOrEqualTo(3));

        // Verificar estrutura dos logs
        for (var log in logs) {
          expect(log, containsPair('user', testUser));
          expect(log, containsPair('action', isA<String>()));
          expect(log, containsPair('timestamp', isA<String>()));
        }
      });

      test('Deve retornar lista vazia para código sem logs', () async {
        final emptyCode = 'EMPTY_CODE_${DateTime.now().millisecondsSinceEpoch}';
        final response = await http.get(
          Uri.parse('$apiUrl?code=$emptyCode'),
        );

        expect(response.statusCode, 200);
        final logs = jsonDecode(response.body) as List;
        expect(logs, isEmpty);
      });

      test('Deve retornar erro 400 quando código não é fornecido', () async {
        final response = await http.get(Uri.parse(apiUrl));

        expect(response.statusCode, 400);
      });
    });

    group('POST /api/logs/join - Registrar Log de Participação', () => {
      test('Deve registrar log de participação como convidado', () async {
        final joinCode = 'JOIN_CODE_${DateTime.now().millisecondsSinceEpoch}';
        final joinData = {
          'user': testUser,
          'code': joinCode,
          'timestamp': DateTime.now().toIso8601String(),
        };

        final response = await http.post(
          Uri.parse('$apiUrl/join'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(joinData),
        );

        expect(response.statusCode, 201);
        final body = jsonDecode(response.body);
        expect(body['message'], 'Log registered successfully.');

        // Verificar se o log foi criado com ação correta
        final getResponse = await http.get(
          Uri.parse('$apiUrl?code=$joinCode'),
        );

        expect(getResponse.statusCode, 200);
        final logs = jsonDecode(getResponse.body) as List;
        expect(logs.length, 1);
        expect(logs[0]['action'], 'joined as a guest');
      });

      test('Deve retornar erro 400 quando campos obrigatórios estão faltando', () async {
        final joinData = {
          'user': testUser,
          // code e timestamp faltando
        };

        final response = await http.post(
          Uri.parse('$apiUrl/join'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(joinData),
        );

        expect(response.statusCode, 400);
        final body = jsonDecode(response.body);
        expect(body['error'], contains('required'));
      });
    });

    group('POST /api/logs/reset - Resetar Logs', () => {
      test('Deve resetar logs de um código específico', () async {
        final resetCode = 'RESET_CODE_${DateTime.now().millisecondsSinceEpoch}';

        // Registrar alguns logs
        for (var i = 0; i < 3; i++) {
          final logData = {
            'user': testUser,
            'action': 'action $i',
            'code': resetCode,
            'timestamp': DateTime.now().toIso8601String(),
          };

          await http.post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(logData),
          );
        }

        // Verificar que logs existem
        var getResponse = await http.get(
          Uri.parse('$apiUrl?code=$resetCode'),
        );
        var logs = jsonDecode(getResponse.body) as List;
        expect(logs.length, 3);

        // Resetar logs
        final resetResponse = await http.post(
          Uri.parse('$apiUrl/reset'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'code': resetCode}),
        );

        expect(resetResponse.statusCode, 200);
        final body = jsonDecode(resetResponse.body);
        expect(body['message'], 'Logs have been reset.');

        // Verificar que logs foram removidos
        getResponse = await http.get(
          Uri.parse('$apiUrl?code=$resetCode'),
        );
        logs = jsonDecode(getResponse.body) as List;
        expect(logs, isEmpty);
      });

      test('Deve retornar erro 400 quando código não é fornecido', () async {
        final response = await http.post(
          Uri.parse('$apiUrl/reset'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({}),
        );

        expect(response.statusCode, 400);
        final body = jsonDecode(response.body);
        expect(body['error'], contains('code'));
      });
    });

    group('Cenários de Integração', () {
      test('Deve manter ordem cronológica dos logs', () async {
        final orderCode = 'ORDER_CODE_${DateTime.now().millisecondsSinceEpoch}';
        final timestamps = <String>[];

        // Registrar logs com timestamps diferentes
        for (var i = 0; i < 5; i++) {
          final timestamp = DateTime.now().add(Duration(seconds: i)).toIso8601String();
          timestamps.add(timestamp);

          final logData = {
            'user': testUser,
            'action': 'action $i',
            'code': orderCode,
            'timestamp': timestamp,
          };

          await http.post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(logData),
          );

          // Pequeno delay para garantir ordem
          await Future.delayed(Duration(milliseconds: 100));
        }

        final response = await http.get(
          Uri.parse('$apiUrl?code=$orderCode'),
        );

        expect(response.statusCode, 200);
        final logs = jsonDecode(response.body) as List;
        expect(logs.length, 5);
      });

      test('Deve suportar múltiplos usuários no mesmo código', () async {
        final multiUserCode = 'MULTI_USER_${DateTime.now().millisecondsSinceEpoch}';
        final users = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

        for (var user in users) {
          final logData = {
            'user': user,
            'action': 'opened lock',
            'code': multiUserCode,
            'timestamp': DateTime.now().toIso8601String(),
          };

          await http.post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(logData),
          );
        }

        final response = await http.get(
          Uri.parse('$apiUrl?code=$multiUserCode'),
        );

        expect(response.statusCode, 200);
        final logs = jsonDecode(response.body) as List;
        expect(logs.length, 3);

        final loggedUsers = logs.map((log) => log['user'] as String).toSet();
        expect(loggedUsers.length, 3);
        expect(loggedUsers, containsAll(users));
      });
    });
  });
}

