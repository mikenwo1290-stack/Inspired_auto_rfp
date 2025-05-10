"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10 w-[250px]"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Your Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Software Dev RFP</CardTitle>
              <CardDescription>Velocity Labs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created 5/6/2025
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Questions Answered</span>
                  <span className="font-medium">30/80</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '37.5%' }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/project?projectId=test_1" className="w-full">
                <Button variant="outline" className="w-full">View Project</Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Add Project Card */}
          <Card className="hover:shadow-md transition-shadow border-dashed flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <Button variant="ghost" size="lg" className="h-24 w-full">
                <div>
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Create New Project</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-medium mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No recent activity to show
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
