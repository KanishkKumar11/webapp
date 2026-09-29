import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import SignUp from "./Signup";

jest.mock("aws-amplify/auth", () => ({ signUp: jest.fn() }));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("react-select-country-list", () =>
  jest.fn(() => ({
    getData: () => [
      { value: "US", label: "United States" },
      { value: "AR", label: "Argentina" },
      { value: "CA", label: "Canada" },
    ],
  })),
);

jest.mock("react-phone-number-input", () => ({
  isValidPhoneNumber: jest.fn(() => true),
}));

jest.mock("../../common/components/PhoneNumberInputWithCountry", () => {
  const React = require("react");
  return function PhoneInputMock(props) {
    React.useLayoutEffect(() => {
      props.setCountryCode?.("US");
      props.setPhone?.("2345678901");
      props.setError?.("");
    }, []);
    return <div data-testid="phone-input-mock" />;
  };
});

jest.mock("../../utils/phone-codes-en", () => ({
  US: { primary: "United States", secondary: "+1", dialCode: "+1" },
}));

describe("SignUp", () => {
  const fillRequiredFields = () => {
    fireEvent.change(document.getElementById("firstName"), {
      target: { value: "John" },
    });

    fireEvent.change(document.getElementById("lastName"), {
      target: { value: "Doe" },
    });

    fireEvent.change(document.getElementById("email"), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(document.getElementById("password"), {
      target: { value: "Password1!" },
    });

    fireEvent.change(document.getElementById("confirmPassword"), {
      target: { value: "Password1!" },
    });
  };

  it("renders the country dropdown with ISO Alpha-2 options", () => {
    render(<SignUp />);
    const select = screen.getByRole("combobox", { name: /country/i });
    expect(select).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "United States" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Argentina" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Canada" })).toBeInTheDocument();
  });

  it("defaults country selection to US", () => {
    render(<SignUp />);
    const select = screen.getByRole("combobox", { name: /country/i });
    expect(select.value).toBe("US");
  });

  it("updates country when a different option is selected", () => {
    render(<SignUp />);
    const select = screen.getByRole("combobox", { name: /country/i });
    fireEvent.change(select, { target: { value: "AR" } });
    expect(select.value).toBe("AR");
  });
  it("keeps Sign Up disabled when a mandatory field is missing", () => {
    render(<SignUp />);

    fireEvent.change(document.getElementById("firstName"), {
      target: { value: "John" },
    });

    fireEvent.change(document.getElementById("lastName"), {
      target: { value: "Doe" },
    });

    // Email is intentionally left empty.

    fireEvent.change(document.getElementById("password"), {
      target: { value: "Password1!" },
    });

    fireEvent.change(document.getElementById("confirmPassword"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("checkbox"));

    const signUpButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    expect(signUpButton).toBeDisabled();
  });

  it("enables Sign Up when all mandatory fields are valid and TOS is accepted", () => {
    render(<SignUp />);

    fillRequiredFields();

    fireEvent.click(screen.getByRole("checkbox"));

    const signUpButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    expect(signUpButton).toBeEnabled();
  });

  it("keeps Sign Up disabled when TOS is not accepted", () => {
    render(<SignUp />);

    fillRequiredFields();

    const signUpButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    expect(signUpButton).toBeDisabled();
  });
});
