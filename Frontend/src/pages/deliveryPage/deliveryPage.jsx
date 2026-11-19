import { useState } from "react";
import { Check } from "lucide-react";

const steps = [
  "Order Placed",
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

const OrderProgress = () => {
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">
        Order Tracking
      </h2>

      <div className="relative">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={index}
              className="relative flex gap-4 pb-10 last:pb-0"
            >
              {/* Connecting Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-[3px] bg-gray-200">
                  <div
                    className={`w-full bg-green-500 transition-all duration-500 ${
                      completed ? "h-full" : "h-0"
                    }`}
                  />
                </div>
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  completed
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                    ? "border-green-500 text-green-500 bg-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {completed ? <Check size={18} /> : index + 1}
              </div>

              {/* Step Details */}
              <div>
                <h3 className="font-medium text-gray-800">
                  {step}
                </h3>

                {active && (
                  <p className="text-sm text-green-600">
                    Current Status
                  </p>
                )}

                {completed && (
                  <p className="text-sm text-gray-500">
                    Completed
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() =>
            setCurrentStep((prev) => Math.max(0, prev - 1))
          }
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Decrease
        </button>

        <button
          onClick={() =>
            setCurrentStep((prev) =>
              Math.min(steps.length - 1, prev + 1)
            )
          }
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Increase
        </button>
      </div>
    </div>
  );
};

export default OrderProgress;