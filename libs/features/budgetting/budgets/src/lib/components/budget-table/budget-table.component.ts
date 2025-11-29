import {
  Component,
  EventEmitter,
  input,
  output,
  ViewChild,
  inject,
  signal,
  effect,
} from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/core';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';

import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
})
export class BudgetTableComponent {
  private readonly _router$$ = inject(Router);
  private readonly _dialog = inject(MatDialog);

  
  budgets = input.required<{ overview: BudgetRecord[]; budgets: any[] }>();
  canPromote = input<boolean>(false);

  // Signal-based output
  doPromote = output<void>();

  
  dataSource = signal(new MatTableDataSource());
  overviewBudgets = signal<BudgetRecord[]>([]);

  displayedColumns: string[] = [
    'name',
    'status',
    'startYear',
    'duration',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('sort', { static: true }) sort: MatSort;

  constructor() {
    effect(() => {
      const budgetsData = this.budgets();
      this.overviewBudgets.set(budgetsData.overview);
      const currentDataSource = this.dataSource();
      currentDataSource.data = budgetsData.budgets;
      this.dataSource.set(currentDataSource);
    });
  }

  ngAfterViewInit(): void {
    const currentDataSource = this.dataSource();
    currentDataSource.paginator = this.paginator;
    currentDataSource.sort = this.sort;
    this.dataSource.set(currentDataSource);
  }

 
  access(requested: any) {
    switch (requested) {
      case 'view':
      case 'clone':
        return true; //budget.access.owner || budget.access.view || budget.access.edit;
      case 'edit':
        return true; // (budget.access.owner || budget.access.edit) && budget.status !== BudgetStatus.InUse && budget.status !== BudgetStatus.InUse;
    }
    return false;
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const currentDataSource = this.dataSource();
    currentDataSource.filter = filterValue.trim().toLowerCase();

    if (currentDataSource.paginator) {
      currentDataSource.paginator.firstPage();
    }

    this.dataSource.set(currentDataSource);
  }

  promote() {
    if (this.canPromote()) this.doPromote.emit();
  }

  /** Open share screen to configure budget access. */
  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent != null ? parent : false,
    });
  }

  /** Open clone screen to clone and reconfigure budget. */
  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false,
    });
  }

  openChildBudgetDialog(parent: Budget): void {
    const overviewBudgetsList = this.overviewBudgets();
    let children: any = overviewBudgetsList.find(
      (budget) => budget.budget.id === parent.id
    )!?.children;
    children = children?.map((child) => child.budget);
    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent: parent, budgets: children },
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router$$
      .navigate(['budgets', budgetId, action])
      .then(() => this._dialog.closeAll());
  }

  deleteBudget(budget: Budget) {}

  translateStatus(status: number) {
    switch (status) {
      case 1:
        return 'BUDGET.STATUS.ACTIVE';
      case 0:
        return 'BUDGET.STATUS.DESIGN';
      case 9:
        return 'BUDGET.STATUS.NO-USE';
      case -1:
        return 'BUDGET.STATUS.DELETED';
      default:
        return '';
    }
  }
}
