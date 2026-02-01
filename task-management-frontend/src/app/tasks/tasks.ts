import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from './task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {

  tasks: any[] = [];
  isLoaded = false;

  isEditing = false;
  editingTaskId: number | null = null;

  newTask = {
    title: '',
    description: '',
    status: '',
    due_date: ''
  };

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoaded = false;

    this.taskService.getTasks().subscribe({
      next: (data: any[]) => {
        this.tasks = data;
        this.isLoaded = true;
      },
      error: (err) => {
        console.error('Task API error:', err);
        this.isLoaded = true;
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  createTask(): void {
    if (
      !this.newTask.title.trim() ||
      !this.newTask.status ||
      !this.newTask.due_date
    ) {
      return;
    }

    // UPDATE
    if (this.isEditing && this.editingTaskId !== null) {
      this.taskService
        .updateTask(this.editingTaskId, this.newTask)
        .subscribe(() => {
          this.resetForm();
          this.loadTasks();
        });
      return;
    }

    // CREATE
    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.resetForm();
        this.loadTasks();
      },
      error: err => console.error(err)
    });
  }

  //DELETE TASK
  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }

  // EDIT TASK
  editTask(task: any): void {
    this.isEditing = true;
    this.editingTaskId = task.id;

    this.newTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date
      ? task.due_date.split('T')[0]   // ✅ FIX
      : ''
    };
  }

  // RESET FORM
  resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      status: '',
      due_date: ''
    };
    this.isEditing = false;
    this.editingTaskId = null;
  }

  logout(): void {
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}

}
