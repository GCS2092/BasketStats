'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface ContentModerationInputProps {
  value: string;
  onChange: (value: string) => void;
  contentType: 'POST' | 'COMMENT' | 'MESSAGE';
  placeholder?: string;
  rows?: number;
  className?: string;
  onModerationResult?: (result: any) => void;
}

interface ModerationResult {
  isClean: boolean;
  shouldBlock: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues: any[];
  score: number;
  suggestions: string[];
}

export default function ContentModerationInput({
  value,
  onChange,
  contentType,
  placeholder = 'Écrivez votre message...',
  rows = 4,
  className = '',
  onModerationResult,
}: ContentModerationInputProps) {
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Mutation pour vérifier le contenu
  const checkContentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!content || content.trim().length === 0) return null;
      
      const response = await apiClient.post('/moderation/check-content', {
        content,
        contentType,
      });
      return response.data as ModerationResult;
    },
    onSuccess: (result) => {
      if (result) {
        setModerationResult(result);
        setShowWarning(result.issues.length > 0);
        onModerationResult?.(result);
      }
    },
  });

  // Vérifier le contenu avec un délai (debounce)
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setModerationResult(null);
      setShowWarning(false);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      checkContentMutation.mutate(value);
      setIsTyping(false);
    }, 1000); // Attendre 1 seconde après la dernière frappe

    return () => clearTimeout(timer);
  }, [value]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50';
      case 'HIGH':
        return 'border-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-neutral-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🚫';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <div className="relative">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
          moderationResult && moderationResult.issues.length > 0
            ? getSeverityColor(moderationResult.severity)
            : 'border-neutral-300'
        } ${className}`}
        disabled={moderationResult?.shouldBlock}
      />

      {/* Indicateur de vérification */}
      {isTyping && (
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-600">Vérification...</span>
        </div>
      )}

      {/* Score de modération */}
      {moderationResult && moderationResult.score > 0 && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-lg shadow-sm border border-neutral-200">
          <span className="text-xs font-semibold">
            Score: <span className={`
              ${moderationResult.score >= 70 ? 'text-red-600' :
                moderationResult.score >= 40 ? 'text-orange-600' :
                moderationResult.score >= 20 ? 'text-yellow-600' :
                'text-blue-600'}
            `}>{moderationResult.score}/100</span>
          </span>
        </div>
      )}

      {/* Avertissements et suggestions */}
      {showWarning && moderationResult && moderationResult.issues.length > 0 && (
        <div className={`mt-3 p-4 rounded-lg border-2 ${
          moderationResult.shouldBlock
            ? 'bg-red-50 border-red-500'
            : moderationResult.severity === 'HIGH'
            ? 'bg-orange-50 border-orange-500'
            : moderationResult.severity === 'MEDIUM'
            ? 'bg-yellow-50 border-yellow-500'
            : 'bg-blue-50 border-blue-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getSeverityIcon(moderationResult.severity)}</div>
            <div className="flex-1">
              {moderationResult.shouldBlock ? (
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">
                    🚫 Contenu bloqué
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Ce contenu ne peut pas être publié car il viole nos règles de la communauté.
                    Un administrateur a été notifié.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">
                    ⚠️ Contenu potentiellement problématique
                  </h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Votre message contient des éléments qui pourraient ne pas être conformes à nos règles.
                  </p>
                </div>
              )}

              {/* Problèmes détectés */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-neutral-700 mb-1">Problèmes détectés :</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  {moderationResult.issues.map((issue, index) => (
                    <li key={index}>
                      • {issue.type === 'FORBIDDEN_WORDS' && `Mots inappropriés détectés (${issue.words?.length})`}
                      {issue.type === 'SUSPICIOUS_PHRASES' && `Phrases suspectes détectées`}
                      {issue.type === 'EMAIL_DETECTED' && `Adresse email détectée`}
                      {issue.type === 'PHONE_DETECTED' && `Numéro de téléphone détecté`}
                      {issue.type === 'SUSPICIOUS_URL' && `Lien suspect détecté`}
                      {issue.type === 'CAPS_LOCK' && `Trop de majuscules`}
                      {issue.type === 'SPAM_PATTERN' && `Motif de spam détecté`}
                      {issue.type === 'REPEAT_OFFENDER' && `Historique de violations (${issue.warningCount} avertissements)`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              {moderationResult.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-700 mb-1">Suggestions :</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    {moderationResult.suggestions.map((suggestion, index) => (
                      <li key={index}>✓ {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                {!moderationResult.shouldBlock && (
                  <button
                    onClick={() => setShowWarning(false)}
                    className="text-xs px-3 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                  >
                    J'ai compris
                  </button>
                )}
                <button
                  onClick={() => onChange('')}
                  className="text-xs px-3 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                >
                  Effacer le texte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message de contenu propre */}
      {moderationResult && moderationResult.isClean && value.length > 10 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
          <span>✅</span>
          <span>Contenu conforme aux règles de la communauté</span>
        </div>
      )}
    </div>
  );
}
