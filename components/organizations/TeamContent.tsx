'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, SearchIcon, MoreHorizontal, TrashIcon, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  avatarUrl?: string;
}

interface TeamContentProps {
  orgId: string;
}

export function TeamContent({ orgId }: TeamContentProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization details
        const orgResponse = await fetch(`/api/organizations/${orgId}`);
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization");
        }
        
        const orgData = await orgResponse.json();
        setOrganization(orgData);
        
        // Fetch organization members
        const membersResponse = await fetch(`/api/organizations/${orgId}/members`);
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          console.log("API response for members:", membersData);
          
          // Transform the data structure to match our TeamMember interface
          const transformedMembers = membersData.map((orgUser: any) => ({
            id: orgUser.userId,
            name: orgUser.user?.name || 'Unknown',
            email: orgUser.user?.email || '',
            role: orgUser.role,
            joinedAt: orgUser.createdAt,
            avatarUrl: orgUser.user?.avatarUrl
          }));
          
          console.log("Transformed members:", transformedMembers);
          setMembers(transformedMembers);
        } else {
          console.error("Failed to fetch members:", await membersResponse.text());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load team data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orgId) {
      fetchData();
    }
  }, [orgId, toast]);

  // Filter members based on search
  const filteredMembers = members.filter(member => 
    (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const handleInviteMember = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsInviting(true);
      
      const response = await fetch(`/api/organizations/${orgId}/members/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite member");
      }
      
      // Simulate adding a new member for demo purposes
      const newMember: TeamMember = {
        id: `tmp-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        joinedAt: new Date().toISOString(),
      };
      
      setMembers([...members, newMember]);
      
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      setInviteRole("member");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite member",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove member");
      }
      
      setMembers(members.filter(m => m.id !== userId));
      
      toast({
        title: "Success",
        description: "Team member removed",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (userId: string, newRole: 'owner' | 'admin' | 'member') => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update member role");
      }
      
      setMembers(members.map(m => 
        m.id === userId ? { ...m, role: newRole } : m
      ));
      
      toast({
        title: "Success",
        description: "Member role updated",
      });
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default">Owner</Badge>;
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-2xl font-semibold">Team</h1>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="text"
                  placeholder="Search team members"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your organization.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email address"
                          autoComplete="email"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select 
                          id="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>List of team members in {organization?.name || 'this organization'}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                      <div className="mt-2 text-muted-foreground">Loading team members...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-muted-foreground">No team members found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.avatarUrl ? (
                              <AvatarImage src={member.avatarUrl} alt={member.name} />
                            ) : null}
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {member.role !== 'owner' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => updateMemberRole(member.id, 'admin')}
                                  disabled={member.role === 'admin'}
                                >
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateMemberRole(member.id, 'member')}
                                  disabled={member.role === 'member'}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Remove from team
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 