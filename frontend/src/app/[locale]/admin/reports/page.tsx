'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionReason, setResolutionReason] = useState('');
  
  useAuthSync();

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Récupérer les signalements
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports', currentPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await apiClient.get(`/admin/reports?${params}`);
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  // Mutation pour résoudre un signalement
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, action, reason }: { reportId: string; action: string; reason?: string }) => {
      const response = await apiClient.put(`/admin/reports/${reportId}/resolve`, { action, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setShowModal(false);
      setResolutionReason('');
    },
  });

  const handleResolveReport = (report: any) => {
    setSelectedReport(report);
    setShowModal(true);
    setResolutionReason('');
  };

  const confirmResolution = (action: string) => {
    if (selectedReport) {
      resolveReportMutation.mutate({ 
        reportId: selectedReport.id, 
        action, 
        reason: resolutionReason || undefined 
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination || {};

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <div className="flex">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                    🚨 Signalements
                  </h1>
                  <p className="text-neutral-600">
                    Traiter les signalements et rapports des utilisateurs
                  </p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-white rounded-lg shadow-sm border border-neutral-200"
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-neutral-200">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PENDING">En attente</option>
                    <option value="INVESTIGATING">En cours d&apos;investigation</option>
                    <option value="RESOLVED">Résolu</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des signalements */}
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold">🚨</span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">
                          Signalement #{report.id.slice(-8)}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Par {report.reporter.fullName} • {new Date(report.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {report.status === 'PENDING' ? 'En attente' :
                       report.status === 'INVESTIGATING' ? 'En cours' :
                       'Résolu'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-neutral-800 mb-2">Raison du signalement</h4>
                        <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                          {report.reason}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-neutral-800 mb-2">Utilisateur signalé</h4>
                        <div className="flex items-center gap-2 bg-neutral-50 p-3 rounded-lg">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {report.reportedUser.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">
                              {report.reportedUser.fullName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {report.reportedUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {report.description && (
                      <div className="mt-4">
                        <h4 className="font-medium text-neutral-800 mb-2">Description</h4>
                        <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {report.reportedPost && (
                      <div className="mt-4">
                        <h4 className="font-medium text-neutral-800 mb-2">Post signalé</h4>
                        <div className="bg-neutral-50 p-3 rounded-lg">
                          <p className="text-sm text-neutral-600 line-clamp-3">
                            {report.reportedPost.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-500">
                      Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </div>

                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => handleResolveReport(report)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Traiter le signalement
                      </button>
                    )}

                    {report.status === 'RESOLVED' && (
                      <div className="text-sm text-neutral-500">
                        Résolu le {new Date(report.resolvedAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-700">
                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                    {pagination.total} signalements
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} sur {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de résolution */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Résoudre le signalement #{selectedReport.id.slice(-8)}
            </h3>
            
            <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-700">
                <strong>Raison:</strong> {selectedReport.reason}
              </p>
              {selectedReport.description && (
                <p className="text-sm text-neutral-700 mt-2">
                  <strong>Description:</strong> {selectedReport.description}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Raison de la résolution (optionnel)
              </label>
              <textarea
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                placeholder="Expliquez l'action prise..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setResolutionReason('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={() => confirmResolution('NO_ACTION')}
                disabled={resolveReportMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Aucune action
              </button>

              <button
                onClick={() => confirmResolution('WARNING')}
                disabled={resolveReportMutation.isPending}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Avertissement
              </button>

              <button
                onClick={() => confirmResolution('SANCTION')}
                disabled={resolveReportMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Sanction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
