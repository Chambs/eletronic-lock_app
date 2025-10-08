import 'dart:convert';
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:shelf_router/shelf_router.dart';

import 'package:log_services/api_router.dart';
import 'package:log_services/log_service.dart';

void main() async {
  final port = int.parse(Platform.environment['PORT'] ?? '3002');
  final address = '0.0.0.0';

  final logService = LogService();
  
  final apiRouter = ApiRouter(logService).router;

  final mainRouter = Router()
    ..get('/api/logs/health', (Request request) {
      return Response.ok(
        jsonEncode({'status': 'OK', 'service': 'log-service'}),
        headers: {'Content-Type': 'application/json'},
      );
    })
    ..mount('/api/logs', apiRouter);

  final handler = Pipeline()
      .addMiddleware(corsHeaders(headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type',
      }))
      .addMiddleware(logRequests())
      .addHandler(mainRouter);

  final server = await io.serve(handler, address, port);
  print('LogService is running on http://${server.address.host}:${server.port}');
}