import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import StatusBadge from "../../src/components/ui/StatusBadge.vue";

describe("StatusBadge.vue", () => {
  it("renders the correct message", () => {
    const wrapper = mount(StatusBadge, { props: { value: "success" } });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
