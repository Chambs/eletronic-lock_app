import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import '../models/Log.dart';

class LogsPage extends StatefulWidget {
  final String registrationCode;
  const LogsPage({super.key, required this.registrationCode});

  @override
  State<LogsPage> createState() => _LogsPageState();
}

class _LogsPageState extends State<LogsPage> {
  bool _isLoading = true;
  String _errorMessage = '';
  List<Log> _logs = [];

  @override
  void initState() {
    super.initState();
    _fetchLogs();
  }

  Future<void> _fetchLogs() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3002/logs?code=${widget.registrationCode}'));

      if (response.statusCode == 200) {
        final List<dynamic> body = jsonDecode(response.body);
        List<Log> fetchedLogs = body.map((dynamic item) => Log.fromJson(item as Map<String, dynamic>)).toList();

        fetchedLogs.sort((a, b) => b.timestamp.compareTo(a.timestamp));

        setState(() {
          _logs = fetchedLogs;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load log history.');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Widget _buildLogCard(Log log) {
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm:ss').format(log.timestamp.toLocal());

    return Card(
      color: Colors.white.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.white.withOpacity(0.1)),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            RichText(
              text: TextSpan(
                style: const TextStyle(color: Colors.white, fontSize: 16, fontFamily: 'Inter'),
                children: <TextSpan>[
                  TextSpan(text: log.user, style: const TextStyle(fontWeight: FontWeight.bold)),
                  const TextSpan(text: ' executed '),
                  TextSpan(text: log.action, style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              formattedDate,
              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Colors.white));
    }
    if (_errorMessage.isNotEmpty) {
      return Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red, fontSize: 16)));
    }
    if (_logs.isEmpty) {
      return const Center(child: Text('No logs found.', style: TextStyle(color: Colors.white, fontSize: 18)));
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            itemCount: _logs.length,
            itemBuilder: (context, index) {
              return _buildLogCard(_logs[index]);
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: OutlinedButton(
            onPressed: () => context.go('/lock/${widget.registrationCode}'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              side: BorderSide(color: Colors.white.withOpacity(0.5)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Back'),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0D1B2A), Color(0xFF000814)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text('Log History', style: TextStyle(color: Colors.white)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/lock/${widget.registrationCode}'),
          ),
        ),
        body: _buildBody(),
      ),
    );
  }
}
