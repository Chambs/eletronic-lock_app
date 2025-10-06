import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/Lock.dart';

class LockPage extends StatefulWidget {
  final Lock? lock;
  final String registrationCode;

  const LockPage({super.key, this.lock, required this.registrationCode});

  @override
  State<LockPage> createState() => _LockPageState();
}

class _LockPageState extends State<LockPage> {
  bool _isLoading = true;
  String _errorMessage = '';
  Map<String, dynamic>? _lockDetails;
  Timer? _statusTimer;

  @override
  void initState() {
    super.initState();
    if (widget.lock != null) {
      _lockDetails = {'lockName': widget.lock!.lockName};
    }
    _fetchInitialDetails();
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchInitialDetails() async {
    try {
      final inviteCodeResponse = await http.get(
        Uri.parse('http://localhost:3003/invite-code?code=${widget.registrationCode}')
      );

      if (inviteCodeResponse.statusCode != 200) {
        throw Exception('Failed to load lock details.');
      }

      final inviteCodeBody = jsonDecode(inviteCodeResponse.body);

      final details = {
        'invitationCode': inviteCodeBody['inviteCode'] ?? '[Error]',
        'lockName': widget.lock?.lockName ?? 'Manage lock',
      };

      setState(() {
        _lockDetails = details;
        _isLoading = false;
      });

      _startStatusPolling();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _startStatusPolling() {
    _statusTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) async {
      try {
        final response = await http.get(Uri.parse('http://localhost:3003/status?code=${widget.registrationCode}'));
        if (response.statusCode == 200) {
          final newStatus = jsonDecode(response.body)['status'];
          if (mounted && _lockDetails?['status'] != newStatus) {
            setState(() {
              _lockDetails?['status'] = newStatus == 'Aberta' ? 'Open' : 'Closed';
            });
          }
        }
      } catch (e) {}
    });
  }

  Future<void> _handleLockAction(String action) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${action == 'ABRIR' ? 'Open' : 'Close'} Lock'),
        content: Text('Are you sure you want to ${action == 'ABRIR' ? 'open' : 'close'} the lock?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Confirm')),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final user = prefs.getString('user');
      final email = prefs.getString('email');

      if (user == null || email == null) throw Exception('Unauthenticated user.');

      await http.post(
        Uri.parse('http://localhost:3001/users/lock-actions'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'user': user, 'action': action, 'code': widget.registrationCode}),
      );

      final newStatus = action == 'ABRIR' ? 'Aberta' : 'Fechada';
      final ns = action == 'ABRIR' ? 'Open' : 'Closed';
      final statusResponse = await http.post(
        Uri.parse('http://localhost:3003/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': newStatus, 'code': widget.registrationCode}),
      );
      
      if (statusResponse.statusCode != 200) {
        throw Exception('Error updating lock status.');
      }

      if (mounted) {
        setState(() {
          _lockDetails?['status'] = ns;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error controlling the lock: ${e.toString()}')),
        );
      }
    }
  }
  
  Future<void> _handleLogHistory() async {
    if (mounted) context.go('/logs/${widget.registrationCode}');
  }

  Future<void> _handleUsers() async {
    if (mounted) context.go('/users/${widget.registrationCode}');
  }

  Future<void> _handleRemoveAccess() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Access'),
        content: const Text('Are you sure you want to remove your access to this lock?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final prefs = await SharedPreferences.getInstance();
        final email = prefs.getString('email');

        if (email == null) {
          throw Exception('Unauthenticated User.');
        }

        final response = await http.post(
          Uri.parse('http://localhost:3003/remove-user-access'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': email,
            'code': widget.registrationCode,
          }),
        );

        if (response.statusCode == 200) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Your access has been successfully removed.')),
            );
            context.go('/home');
          }
        } else {
          throw Exception(jsonDecode(response.body)['error'] ?? 'Error removing access.');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
          );
        }
      }
    }
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Colors.white));
    }
    if (_errorMessage.isNotEmpty) {
      return Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red, fontSize: 16)));
    }
    if (_lockDetails == null) {
      return const Center(child: Text('No details found.', style: TextStyle(color: Colors.white)));
    }

    final primaryButtonStyle = ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF00040D).withOpacity(0.8),
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 50),
      textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      side: BorderSide(color: Colors.white.withOpacity(0.2)),
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  _lockDetails!['lockName'] ?? 'Gerenciar',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Status: ', style: TextStyle(color: Colors.white70, fontSize: 18)),
                    Text(
                      _lockDetails?['status'] ?? '...',
                      style: TextStyle(
                        color: _lockDetails?['status'] == 'Open' ? Colors.greenAccent : Colors.orangeAccent,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Invite code: ', style: TextStyle(color: Colors.white70, fontSize: 18)),
                    SelectableText(
                      _lockDetails!['invitationCode'],
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy, color: Colors.white70, size: 20),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: _lockDetails!['invitationCode']));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Code copied!!')));
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),

          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.lock_open_rounded),
                  label: const Text('Open'),
                  onPressed: () => _handleLockAction('ABRIR'),
                  style: primaryButtonStyle.copyWith(
                    backgroundColor: MaterialStateProperty.all(Colors.green.shade800.withOpacity(0.8)),
                  ),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.lock_outline_rounded),
                  label: const Text('Close'),
                  onPressed: () => _handleLockAction('FECHAR'),
                  style: primaryButtonStyle.copyWith(
                     backgroundColor: MaterialStateProperty.all(Colors.orange.shade900.withOpacity(0.8)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),

          ElevatedButton.icon(
            icon: const Icon(Icons.history),
            label: const Text('Log History'),
            onPressed: _handleLogHistory,
            style: primaryButtonStyle,
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            icon: const Icon(Icons.group),
            label: const Text('Registered Users'),
            onPressed: _handleUsers,
            style: primaryButtonStyle,
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            icon: const Icon(Icons.link_off),
            label: const Text('Disconnect'),
            onPressed: _handleRemoveAccess,
            style: primaryButtonStyle.copyWith(
              backgroundColor: MaterialStateProperty.all(Colors.red.shade900.withOpacity(0.7)),
            ),
          ),
          const SizedBox(height: 30),
          OutlinedButton(
            onPressed: () => context.go('/home'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              side: BorderSide(color: Colors.white.withOpacity(0.5)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Back'),
          ),
        ],
      ),
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
          title: const Text('Manage lock', style: TextStyle(color: Colors.white)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        ),
        body: _buildBody(),
      ),
    );
  }
}
