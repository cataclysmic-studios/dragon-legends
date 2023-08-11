import { Service, OnInit, OnTick } from "@flamework/core";
import Signal from "@rbxts/signal";

@Service()
export class SchedulingService implements OnTick {
  private counter = 0;
  public everySecond = new Signal;

  public onTick(step: number): void {
    this.counter += step;
    if (this.counter >= 1) {
      this.counter--;
      this.everySecond.Fire();
    }
  }
}