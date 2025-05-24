'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Calendar, 
  FolderOpen, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ProjectDocument {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  size_bytes?: number;
  indexName: string;
  indexId: string;
}

interface ProjectIndex {
  id: string;
  name: string;
}

interface ProjectDocumentsProps {
  projectId: string;
}

const INITIAL_DOCUMENTS_SHOWN = 5;

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projectIndexes, setProjectIndexes] = useState<ProjectIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationConnected, setOrganizationConnected] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState<Record<string, boolean>>({});
  const [shownDocuments, setShownDocuments] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchProjectDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the project indexes
      const indexesResponse = await fetch(`/api/projects/${projectId}/indexes`);
      
      if (!indexesResponse.ok) {
        const errorData = await indexesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch project indexes');
      }
      
      const indexesData = await indexesResponse.json();
      
      if (!indexesData.organizationConnected) {
        setOrganizationConnected(false);
        setProjectIndexes([]);
        setDocuments([]);
        return;
      }

      setOrganizationConnected(true);
      setProjectIndexes(indexesData.currentIndexes || []);

      // If no indexes are selected, show empty state
      if (!indexesData.currentIndexes || indexesData.currentIndexes.length === 0) {
        setDocuments([]);
        return;
      }

      // Get organization ID from project
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project details');
      }
      const projectData = await projectResponse.json();

      // Fetch all organization documents
      const documentsResponse = await fetch(`/api/llamacloud/documents?organizationId=${projectData.organizationId}`);
      
      if (!documentsResponse.ok) {
        const errorData = await documentsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch documents');
      }
      
      const documentsData = await documentsResponse.json();
      
      // Filter documents to only include those from selected indexes
      const selectedIndexIds = new Set(indexesData.currentIndexes.map((index: ProjectIndex) => index.id));
      const filteredDocuments = (documentsData.documents || []).filter((doc: any) => 
        selectedIndexIds.has(doc.pipelineId)
      ).map((doc: any) => ({
        ...doc,
        indexName: doc.pipelineName,
        indexId: doc.pipelineId,
        // Map file properties to document properties for consistency
        name: doc.file_name || doc.name,
        status: doc.status || 'unknown',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        size_bytes: doc.file_size,
      }));

      setDocuments(filteredDocuments);

      // Auto-expand first index and initialize shown documents
      if (filteredDocuments.length > 0) {
        const indexNames: string[] = Array.from(new Set(filteredDocuments.map((doc: ProjectDocument) => doc.indexName)));
        const initialExpanded: Record<string, boolean> = {};
        const initialShown: Record<string, number> = {};
        
        indexNames.forEach((indexName, index) => {
          initialExpanded[indexName] = index === 0; // Expand first index
          initialShown[indexName] = INITIAL_DOCUMENTS_SHOWN;
        });
        
        setExpandedIndexes(initialExpanded);
        setShownDocuments(initialShown);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project documents';
      setError(errorMessage);
      console.error('Error fetching project documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDocuments();
  }, [projectId]);

  const handleRefresh = () => {
    fetchProjectDocuments();
    toast({
      title: 'Refreshing',
      description: 'Fetching latest documents...',
    });
  };

  const toggleIndex = (indexName: string) => {
    setExpandedIndexes(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const showMoreDocuments = (indexName: string) => {
    setShownDocuments(prev => ({
      ...prev,
      [indexName]: (prev[indexName] || INITIAL_DOCUMENTS_SHOWN) + INITIAL_DOCUMENTS_SHOWN
    }));
  };

  const showAllDocuments = (indexName: string, totalCount: number) => {
    setShownDocuments(prev => ({
      ...prev,
      [indexName]: totalCount
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!organizationConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Documents
          </CardTitle>
          <CardDescription>
            Documents available to this project from selected indexes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No LlamaCloud Connection</h3>
            <p className="text-muted-foreground">
              Your organization needs to be connected to LlamaCloud to access documents.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Documents
          </CardTitle>
          <CardDescription>
            Documents available to this project from selected indexes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Documents</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProjectDocuments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projectIndexes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Documents
          </CardTitle>
          <CardDescription>
            Documents available to this project from selected indexes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Indexes Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select indexes above to access their documents for this project.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group documents by index
  const documentsByIndex = documents.reduce((acc, doc) => {
    if (!acc[doc.indexName]) {
      acc[doc.indexName] = [];
    }
    acc[doc.indexName].push(doc);
    return acc;
  }, {} as Record<string, ProjectDocument[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Documents
            </CardTitle>
            <CardDescription>
              {documents.length} documents available from {projectIndexes.length} selected {projectIndexes.length === 1 ? 'index' : 'indexes'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
            <p className="text-muted-foreground">
              No documents were found in the selected indexes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(documentsByIndex).map(([indexName, indexDocs]) => {
              const isExpanded = expandedIndexes[indexName] || false;
              const shownCount = shownDocuments[indexName] || INITIAL_DOCUMENTS_SHOWN;
              const hasMore = indexDocs.length > shownCount;
              const visibleDocs = indexDocs.slice(0, shownCount);
              
              return (
                <Card key={indexName} className="border-l-4 border-l-blue-500">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleIndex(indexName)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="mr-2 h-4 w-4" />
                          ) : (
                            <ChevronRight className="mr-2 h-4 w-4" />
                          )}
                          <Database className="mr-2 h-4 w-4" />
                          {indexName}
                          <Badge variant="secondary" className="ml-2">
                            {indexDocs.length} {indexDocs.length === 1 ? 'document' : 'documents'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {visibleDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{doc.name}</p>
                                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {formatDate(doc.updated_at)}
                                    </span>
                                    <span>{formatFileSize(doc.size_bytes)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(doc.status)}>
                                  {doc.status}
                                </Badge>
                                <Button variant="ghost" size="sm" asChild>
                                  <a
                                    href={`https://cloud.llamaindex.ai/project/${doc.indexId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {hasMore && (
                            <div className="flex justify-center space-x-2 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => showMoreDocuments(indexName)}
                              >
                                Show {Math.min(INITIAL_DOCUMENTS_SHOWN, indexDocs.length - shownCount)} more
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => showAllDocuments(indexName, indexDocs.length)}
                              >
                                Show all ({indexDocs.length})
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 