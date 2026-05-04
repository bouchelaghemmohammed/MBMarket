import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { PricePipe } from '../../pipes/price.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  loading = true;
  private orderCreatedSub!: Subscription;

  constructor(
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.loadOrders();

    this.orderCreatedSub = this.socketService.listen('order:created').subscribe(order => {
      // Check if order belongs to current user or if current user is admin (simplified for UI update)
      // Since it's demo, we will just add it if it's the current user's or refresh
      this.loadOrders(); 
    });
  }

  loadOrders() {
    this.loading = true;
    this.apiService.getOrders().subscribe({
      next: (data) => {
        this.orders = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.orderCreatedSub) {
      this.orderCreatedSub.unsubscribe();
    }
  }
}
