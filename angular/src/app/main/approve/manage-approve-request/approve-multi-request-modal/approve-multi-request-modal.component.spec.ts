import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ApproveMultiRequestModalComponent } from "./approve-multi-request-modal.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";

describe("ApproveMultiRequestModalComponent", () => {

  let fixture: ComponentFixture<ApproveMultiRequestModalComponent>;
  let component: ApproveMultiRequestModalComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
      ],
      declarations: [ApproveMultiRequestModalComponent]
    });

    fixture = TestBed.createComponent(ApproveMultiRequestModalComponent);
    component = fixture.componentInstance;

  });

  it("should be able to create component instance", () => {
    expect(component).toBeDefined();
  });
  
});
