import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ConfirmDialog from "../../src/components/ui/ConfirmDialog.vue";

describe("ConfirmDialog.vue", () => {
  it("renders with default props", () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: "Test Title",
        message: "Test Message",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("renders with custom props", () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: "Custom Title",
        message: "Custom Message",
        confirmLabel: "Yes",
        cancelLabel: "No",
        confirmColor: "positive",
        loading: true,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("emits confirm event when confirm button is clicked", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: "Test",
        message: "Test",
      },
    });

    await wrapper.findAll("q-btn")[1]?.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("confirm");
  });

  it("emits cancel and update:modelValue events when cancel button is clicked", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: "Test",
        message: "Test",
      },
    });

    await wrapper.findAll("q-btn")[0]?.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("cancel");
    expect(wrapper.emitted()).toHaveProperty("update:modelValue");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([false]);
  });

  it("shows loading state on confirm button", () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: "Test",
        message: "Test",
        loading: true,
      },
    });

    const confirmButton = wrapper.findAll("q-btn")[1];
    expect(confirmButton?.attributes("loading")).toBeDefined();
  });
});
