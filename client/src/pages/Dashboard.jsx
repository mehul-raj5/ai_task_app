import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Added back for the filter card
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import { taskService } from "@/services/taskService";
import TaskList from "@/components/TaskList";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import ParseTextDialog from "@/components/ParseTextDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  // --- STATE MANAGEMENT ---
  const {
    tasks = [],
    isLoading = false,
    filters = {},
    pagination = {},
    setTasks,
    setLoading,
    setFilters,
    setPagination,
  } = useTaskStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showParseDialog, setShowParseDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    priority: { P1: 0, P2: 0, P3: 0, P4: 0 },
    status: { todo: 0, "in-progress": 0, completed: 0 },
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [filters?.priority, filters?.status, pagination?.currentPage]);

  const loadStats = async () => {
    try {
      const response = await taskService.getTaskStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination?.currentPage || 1,
        limit: pagination?.limit || 10,
        sortBy: filters?.sortBy || "createdAt",
        sortOrder: filters?.sortOrder || "desc",
      };

      if (filters?.priority && filters.priority !== "all") {
        params.priority = filters.priority;
      }
      if (filters?.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response = await taskService.getTasks(params);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // --- EVENT HANDLERS ---
  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePriorityFilter = (priority) => {
    setFilters({ ...filters, priority });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status });
    setPagination({ ...pagination, currentPage: 1 });
  };

  // --- STYLE HELPERS (MODIFIED TO REFLECT ORIGINAL THEME) ---

  const getPriorityButtonStyle = (priority) => {
    const isActive = filters.priority === priority;
    switch (priority) {
      case "all":
        return isActive ? "bg-teal text-white" : "border-teal/30 text-teal";
      case "P1":
        return isActive ? "bg-burgundy text-white" : "border-burgundy/30 text-burgundy";
      case "P2":
        return isActive ? "bg-orange-500 text-white" : "border-orange-300 text-orange-600";
      case "P3":
        return isActive ? "bg-yellow-500 text-white" : "border-yellow-300 text-yellow-600";
      case "P4":
        return isActive ? "bg-green-500 text-white" : "border-green-300 text-green-600";
      default:
        return "border-teal/30 text-teal";
    }
  };

  // Styled the new status filter to match the original theme's look and feel
  const getStatusButtonStyle = (status) => {
      const isActive = filters.status === status;
      return isActive ? 'bg-teal text-white' : 'border-teal/30 text-teal';
  };


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage via-sage/90 to-sage/80">
      <header className="bg-white/80 backdrop-blur-md border-b border-teal/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-teal/10 rounded-lg">
                <FileText className="h-6 w-6 text-teal" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-midnight-blue">
                  Task Dashboard
                </h1>
                <p className="text-sm text-midnight-blue/70">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParseDialog(true)}
                className="border-teal/30 text-teal hover:bg-teal/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                Parse Text
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-teal hover:bg-teal/90 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-midnight-blue hover:text-burgundy"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-teal/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-midnight-blue/70">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-midnight-blue">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="border-teal/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-midnight-blue/70">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-burgundy">
                {stats.priority.P1}
              </div>
            </CardContent>
          </Card>
          <Card className="border-teal/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-midnight-blue/70">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal">
                {stats.status["in-progress"]}
              </div>
            </CardContent>
          </Card>
          <Card className="border-teal/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-midnight-blue/70">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.status.completed}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 border-teal/20">
           <CardHeader>
             <CardTitle className="text-midnight-blue">
               Task Management
             </CardTitle>
             <CardDescription>
               Manage and organize your tasks efficiently
             </CardDescription>
           </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Status Filter Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={filters.status === "all" ? "default" : "outline"}
                  onClick={() => handleStatusFilter("all")}
                  className={getStatusButtonStyle("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.status === "todo" ? "default" : "outline"}
                  onClick={() => handleStatusFilter("todo")}
                  className={getStatusButtonStyle("todo")}
                >
                  To Do
                </Button>
                <Button
                   size="sm"
                   variant={filters.status === "in-progress" ? "default" : "outline"}
                   onClick={() => handleStatusFilter("in-progress")}
                   className={getStatusButtonStyle("in-progress")}
                >
                  In Progress
                </Button>
                <Button
                   size="sm"
                   variant={filters.status === "completed" ? "default" : "outline"}
                   onClick={() => handleStatusFilter("completed")}
                   className={getStatusButtonStyle("completed")}
                >
                  Completed
                </Button>
              </div>

              {/* Priority Filter Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={filters.priority === "all" ? "default" : "outline"}
                  onClick={() => handlePriorityFilter("all")}
                  className={getPriorityButtonStyle("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.priority === "P1" ? "default" : "outline"}
                  onClick={() => handlePriorityFilter("P1")}
                  className={getPriorityButtonStyle("P1")}
                >
                  P1
                </Button>
                <Button
                   size="sm"
                   variant={filters.priority === "P2" ? "default" : "outline"}
                   onClick={() => handlePriorityFilter("P2")}
                   className={getPriorityButtonStyle("P2")}
                >
                  P2
                </Button>
                <Button
                   size="sm"
                   variant={filters.priority === "P3" ? "default" : "outline"}
                   onClick={() => handlePriorityFilter("P3")}
                   className={getPriorityButtonStyle("P3")}
                >
                  P3
                </Button>
                <Button
                   size="sm"
                   variant={filters.priority === "P4" ? "default" : "outline"}
                   onClick={() => handlePriorityFilter("P4")}
                   className={getPriorityButtonStyle("P4")}
                >
                  P4
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List Component */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={() => {
            loadTasks();
            loadStats();
          }}
        />
      </main>

      {/* Dialog Components */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          loadTasks();
          loadStats();
        }}
      />

      <ParseTextDialog
        open={showParseDialog}
        onOpenChange={setShowParseDialog}
        onSuccess={() => {
          loadTasks();
          loadStats();
        }}
      />
    </div>
  );
}