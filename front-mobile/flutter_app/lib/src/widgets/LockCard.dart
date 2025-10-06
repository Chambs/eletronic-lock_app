import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/Lock.dart';

class LockCard extends StatelessWidget {
  final Lock lock;
  const LockCard({super.key, required this.lock});

  void handleNavigate(BuildContext context, String registrationCode) {
    context.go('/lock/$registrationCode');
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.white.withOpacity(0.2)),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Text('🔑', style: const TextStyle(fontSize: 40)),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Lock name: ${lock.lockName}',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text('Role: ', style: TextStyle(color: Colors.white70)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: lock.isAdmin ? Colors.amber.shade800 : Colors.blue.shade800,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          lock.isAdmin ? 'Admin' : 'Guest',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () => handleNavigate(context, lock.registrationCode),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E3A8A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Manage'),
            ),
          ],
        ),
      ),
    );
  }
}