'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronRight, FileText } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  orgId: string;
}

export function ProjectCard({ project, orgId }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-lg">{project.name}</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {project.description || 'No description'}
        </p>
        <Link href={`/project?projectId=${project.id}&orgId=${orgId}`}>
          <Button className="w-full">
            Open Project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 