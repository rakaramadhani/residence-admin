"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@supabase/supabase-js";
import { Building2, DollarSign, Search, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Cluster, fetchClusters, fetchUsers } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ClusterWithStats extends Cluster {
  jumlahPenghuni: number;
  totalIuran: number;
}

export function ClusterOverview() {
  const [clusters, setClusters] = useState<ClusterWithStats[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<ClusterWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch clusters and users data
      const [clustersData, usersData] = await Promise.all([
        fetchClusters(),
        fetchUsers()
      ]);

      // Calculate statistics for each cluster
      const clustersWithStats: ClusterWithStats[] = clustersData.map(cluster => {
        const penghuniCluster = usersData.filter(user => user.cluster === cluster.nama_cluster);
        const jumlahPenghuni = penghuniCluster.length;
        const totalIuran = jumlahPenghuni * cluster.nominal_tagihan;
        
        return {
          ...cluster,
          jumlahPenghuni,
          totalIuran
        };
      });

      setClusters(clustersWithStats);
      setFilteredClusters(clustersWithStats);
    } catch (error) {
      console.error("Error fetching cluster data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("cluster_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Cluster" },
        async (payload) => {
          console.log("Cluster changed (Overview):", payload);
          await fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User" },
        async (payload) => {
          console.log("User changed (Cluster Overview):", payload);
          await fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter clusters based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClusters(clusters);
    } else {
      const filtered = clusters.filter(cluster =>
        cluster.nama_cluster.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClusters(filtered);
    }
  }, [searchTerm, clusters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Overview Cluster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data cluster...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total stats
  const totalStats = {
    totalCluster: clusters.length,
    totalPenghuni: clusters.reduce((sum, cluster) => sum + cluster.jumlahPenghuni, 0),
    totalIuran: clusters.reduce((sum, cluster) => sum + cluster.totalIuran, 0)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Overview Cluster
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quick Stats Summary */}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg w-full">
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalCluster}</div>
            <div className="text-xs text-gray-600">Total Cluster</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg w-full">
            <div className="text-2xl font-bold text-green-600">{totalStats.totalPenghuni}</div>
            <div className="text-xs text-gray-600">Total Penghuni</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg w-full">
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(totalStats.totalIuran)}
            </div>
            <div className="text-xs text-gray-600">Total Iuran</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari cluster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Compact Table View */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Cluster</TableHead>
                <TableHead className="text-center">Penghuni</TableHead>
                <TableHead className="text-right">IPL/KK</TableHead>
                <TableHead className="text-right">Total Iuran/Bulan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Tidak ada cluster yang sesuai pencarian" : "Belum ada data cluster"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClusters.map((cluster) => (
                  <TableRow key={cluster.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{cluster.nama_cluster}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{cluster.jumlahPenghuni} KK</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="font-medium">
                          {formatCurrency(cluster.nominal_tagihan)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3 text-orange-500" />
                        <span className="font-semibold">
                          {formatCurrency(cluster.totalIuran)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Summary for Filtered Results */}
        {filteredClusters.length > 0 && searchTerm && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Hasil Pencarian: {filteredClusters.length} cluster</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-bold text-green-600">
                  {filteredClusters.reduce((sum, cluster) => sum + cluster.jumlahPenghuni, 0)}
                </div>
                <div className="text-xs text-gray-500">Total Penghuni</div>
              </div>
              <div>
                <div className="font-bold text-orange-600">
                  {formatCurrency(filteredClusters.reduce((sum, cluster) => sum + cluster.totalIuran, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Iuran</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 