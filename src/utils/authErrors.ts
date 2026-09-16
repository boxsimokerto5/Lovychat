export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Terjadi kesalahan otentikasi. Silakan coba lagi.';

  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/invalid-credential' || message.includes('invalid-credential')) {
    return 'Email atau kata sandi tidak cocok. Pastikan alamat email dan sandi sudah benar.';
  }
  if (code === 'auth/user-not-found' || message.includes('user-not-found') || message.includes('belum terdaftar')) {
    return 'Akun belum terdaftar. Silakan pilih tab "Daftar Baru" untuk membuat akun terlebih dahulu.';
  }
  if (code === 'auth/wrong-password' || message.includes('salah')) {
    return 'Kata sandi yang Anda masukkan salah. Periksa huruf besar/kecil.';
  }
  if (code === 'auth/invalid-email') {
    return 'Format email tidak valid. Harap masukkan alamat email yang benar (contoh: nama@email.com).';
  }
  if (code === 'auth/email-already-in-use' || message.includes('sudah terdaftar')) {
    return 'Email ini sudah terdaftar. Silakan beralih ke tab "Masuk Email" untuk login.';
  }
  if (code === 'auth/weak-password') {
    return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
  }
  if (code === 'auth/network-request-failed' || message.includes('fetch')) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  }

  return error.message || 'Gagal masuk. Silakan periksa data yang Anda masukkan dan coba lagi.';
}

export const getFirebaseAuthErrorMessage = getAuthErrorMessage;
