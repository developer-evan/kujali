import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';

import { Logger } from '@iote/bricks-angular';

import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';

import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';

import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';


@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', 
              '../../components/budget-view-styles.scss'],
})
/** List of all active budgets on the system. */
export class SelectBudgetPageComponent implements OnInit
{
  // Inject dependencies using modern inject() function
  private readonly _orgBudgets$$ = inject(OrgBudgetsStore);
  private readonly _budgets$$ = inject(BudgetsStore);
  private readonly _dialog = inject(MatDialog);
  private readonly _logger = inject(Logger);

  // Convert observables to signals using toSignal
  private readonly overview = toSignal(this._orgBudgets$$.get(), { initialValue: [] as OrgBudgetsOverview });
  private readonly sharedBudgets = toSignal(this._budgets$$.get(), { initialValue: [] });

  // UI state as signal
  readonly showFilter = signal(false);

  // Computed signal that combines overview and budgets data
  readonly allBudgets = computed(() => {
    const overview = this.overview();
    const budgets = this.sharedBudgets();
    
    const flattenedOverview = __flatMap(overview);
    const flattenedBudgets = __flatMap(budgets);
    
    // Transform budgets to include endYear
    const transformedBudgets = flattenedBudgets.map((budget: any) => ({
      ...budget,
      endYear: budget.startYear + budget.duration - 1
    }));
    
    return {
      overview: flattenedOverview,
      budgets: transformedBudgets
    };
  });

  ngOnInit() {
    // Component initialization if needed
    // Data loading is handled declaratively through signals
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Filter logic can be implemented as needed
  }

  fieldsFilter(value: (invoice: any) => boolean) {    
    // Filter logic can be implemented as needed
  }

  toggleFilter(value: any) {
    this.showFilter.set(!!value);
  }

  openDialog(parent : Budget | false): void 
  {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });

    dialog.afterClosed().subscribe(() => {
      // Dialog after action
    })
  }

  /** 
   * @TODO - Review and fix
   * Returns true if the budget can be activated */
  canPromote(record: BudgetRecord) {
    // Get's set on Budget Read from user privileges and budget status.
    return (record.budget as any).canBeActivated;
  }

  /** Activate budget -> Promote to be used in  */
  setActive(record: BudgetRecord) 
  {
    const toSave = ___cloneDeep(record.budget);

    // Clean up budget record values.
    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    // Set Active
    toSave.status = BudgetStatus.InUse;

    (<any> record).updating = true;
    
    // Fire update using signal-based approach
    this._budgets$$.update(toSave)
      .subscribe(() => {
        (<any> record).updating = false;
        this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`) 
      });
  }
}