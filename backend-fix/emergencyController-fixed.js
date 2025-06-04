const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get Emergency
const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({
            include: { user: true },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get Emergency Alert untuk Modal Warning - DIPERBAIKI
const getEmergencyAlert = async (req, res) => {
    try {
        // Ambil emergency terbaru (5 menit terakhir untuk dianggap "alert")
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const emergencyAlert = await prisma.emergency.findFirst({
            where: {
                created_at: {
                    gte: fiveMinutesAgo // Emergency dalam 5 menit terakhir
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true, // Sesuaikan dengan schema - phone bukan no_hp
                        cluster: true
                    }
                }
            }
        });
        
        res.status(200).json({ 
            message: "Success", 
            data: emergencyAlert,
            hasAlert: !!emergencyAlert // Boolean untuk cek ada alert atau tidak
        });
    } catch (error) {
        console.error('Emergency alert error:', error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// Alternative: Get Emergency Alert dengan logika berbeda
const getEmergencyAlertAlternative = async (req, res) => {
    try {
        // Ambil emergency terbaru saja
        const emergencyAlert = await prisma.emergency.findFirst({
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                        cluster: true
                    }
                }
            }
        });
        
        // Cek apakah emergency ini dalam 10 menit terakhir
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const isRecentEmergency = emergencyAlert && 
            new Date(emergencyAlert.created_at) > tenMinutesAgo;
        
        res.status(200).json({ 
            message: "Success", 
            data: isRecentEmergency ? emergencyAlert : null,
            hasAlert: isRecentEmergency
        });
    } catch (error) {
        console.error('Emergency alert error:', error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// Optional: Backend Subscription untuk Additional Processing
const initEmergencySubscription = () => {
    const channel = supabase
        .channel('emergency_backend')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public', 
            table: 'emergency'
        }, async (payload) => {
            try {
                console.log('Emergency baru detected:', payload.new);
                
                // Additional processing bisa ditambahkan di sini:
                // 1. Send email notification
                // 2. Push notification ke mobile
                // 3. Log ke external service
                // 4. Send WhatsApp/Telegram alert
                
            } catch (error) {
                console.error('Error processing emergency:', error);
            }
        })
        .subscribe();
        
    console.log('Emergency subscription initialized');
    return channel;
};

module.exports = {
    getEmergency, 
    getEmergencyAlert, 
    getEmergencyAlertAlternative, 
    initEmergencySubscription
}; 