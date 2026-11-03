import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Matikan cache statis Next.js agar status selalu live dan real-time
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET: Membaca status buka/tutup toko langsung dari Supabase
export async function GET() {
  try {
    let setting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    // Jika baris pertama belum pernah dibuat, inisialisasi default toko buka
    if (!setting) {
      setting = await prisma.storeSetting.create({
        data: { id: 'default', isOpen: true },
      });
    }

    return NextResponse.json(
      { success: true, isOpen: Boolean(setting.isOpen) },
      {
        status: 200,
        headers: noCacheHeaders,
      }
    );
  } catch (error) {
    console.error('Error GET /api/store-status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil status operasional dari database' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Mengubah status toko dari dashboard admin
export async function POST(req) {
  try {
    const body = await req.json();

    if (typeof body?.isOpen !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Parameter isOpen wajib bernilai boolean (true/false)' },
        { status: 400 }
      );
    }

    const updated = await prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: { isOpen: body.isOpen },
      create: { id: 'default', isOpen: body.isOpen },
    });

    return NextResponse.json({
      success: true,
      isOpen: updated.isOpen,
    });
  } catch (error) {
    console.error('Error POST /api/store-status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status ke database' },
      { status: 500 }
    );
  }
}