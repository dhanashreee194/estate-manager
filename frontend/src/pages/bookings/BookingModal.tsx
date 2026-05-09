import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBooking,
  getAvailableUnits,
  updateBooking,
} from "../../api/booking";
import { getProjects } from "../../api/project";
import { getWings, getWingsByBuilding } from "../../api/wing";
import { getProjectBuildings } from "../../api/building";
import "./bookings.css";
import { getUnitsByWing } from "../../api/unit";
import BookingPaymentModal from "./BookingPaymentModal";

export default function BookingModal({
  onClose,
  booking,
  onBookingSuccess,
}: any) {
  // ✅ 1. STATE FIRST
  const [form, setForm] = useState({
    projectId: "",
    buildingId: "",
    wingId: "",
    unitId: "",

    name: "",
    phone: "",
    email: "",
    address: "",

    builtUpSqft: 0,
    marketRate: 0,

    gstAmount: 0,
    maintenanceFee: 0,
    advocateFee: 0,
    mecbFee: 0,
    oneTimeMaint: 0,

    govtSqMeter: 0,
    govtValue: 0,
    stampDuty: 0,
    registrationFee: 0,

    totalPrice: 0,
    govtAmount: 0,
    cashAmount: 0,
  });
  useEffect(() => {
    if (!booking) return;

    setForm({
      projectId: booking.projectId,

      buildingId: booking.unit?.wing?.buildingId || "",
      wingId: booking.unit?.wingId || "",
      unitId: booking.unitId || "",

      name: booking.customer?.name || "",
      phone: booking.customer?.phone || "",
      email: booking.customer?.email || "",
      address: booking.customer?.address || "",

      builtUpSqft: booking.builtUpSqft || 0,
      marketRate: booking.marketRate || 0,

      gstAmount: booking.gstAmount || 0,
      maintenanceFee: booking.maintenanceFee || 0,
      advocateFee: booking.advocateFee || 0,
      mecbFee: booking.mecbFee || 0,
      oneTimeMaint: booking.oneTimeMaint || 0,

      govtSqMeter: booking.govtSqMeter || 0,
      govtValue: booking.govtValue || 0,
      stampDuty: booking.stampDuty || 0,
      registrationFee: booking.registrationFee || 0,

      totalPrice: booking.totalPrice || 0,
      govtAmount: booking.govtAmount || 0,
      cashAmount: booking.cashAmount || 0,
    });
  }, [booking]);

  // ✅ 2. THEN QUERIES
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings", form.projectId],
    queryFn: () => getProjectBuildings(form.projectId),
    enabled: !!form.projectId,
  });

  const { data: wings = [] } = useQuery({
    queryKey: ["wings", form.buildingId],
    queryFn: () => getWingsByBuilding(form.buildingId),
    enabled: !!form.buildingId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units", form.wingId],
    queryFn: () => getUnitsByWing(form.wingId),
    enabled: !!form.wingId,
  });

  // ✅ 3. HANDLERS
  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const qc = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: (payload: any) => {
      if (booking) {
        return updateBooking(booking.id, payload);
      }
      return createBooking(payload);
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["bookings", form.projectId] });
      qc.invalidateQueries({ queryKey: ["available-units", form.projectId] });

      if (!booking) {
        onBookingSuccess(data.id); // open payment only for new booking
      } else {
        onClose(); // just close for edit
      }
    },
  });

  const handleSubmit = () => {
    if (!form.unitId || !form.name || !form.phone) {
      alert("Please fill required fields");
      return;
    }

    const builtUpValue = form.builtUpSqft * form.marketRate;

    const total =
      builtUpValue +
      form.gstAmount +
      form.maintenanceFee +
      form.advocateFee +
      form.mecbFee +
      form.oneTimeMaint +
      form.govtValue +
      form.stampDuty +
      form.registrationFee;

    bookingMutation.mutate({
      unitId: form.unitId,
      projectId: form.projectId,

      // Customer
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,

      // Builder
      builtUpSqft: form.builtUpSqft,
      marketRate: form.marketRate,

      gstAmount: form.gstAmount,
      maintenanceFee: form.maintenanceFee,
      advocateFee: form.advocateFee,
      mecbFee: form.mecbFee,
      oneTimeMaint: form.oneTimeMaint,

      // Govt
      govtSqMeter: form.govtSqMeter,
      govtValue: form.govtValue,
      stampDuty: form.stampDuty,
      registrationFee: form.registrationFee,

      // Totals
      totalPrice: total,
      govtAmount: form.govtValue + form.stampDuty + form.registrationFee,

      cashAmount:
        builtUpValue +
        form.gstAmount +
        form.maintenanceFee +
        form.advocateFee +
        form.mecbFee +
        form.oneTimeMaint,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h4>{booking ? "Edit Booking" : "New Booking"}</h4>

        {/* Project */}
        <select
          className="form-control"
          value={form.projectId}
          onChange={(e) =>
            setForm({
              ...form,
              projectId: e.target.value,
              buildingId: "",
              wingId: "",
              unitId: "",
            })
          }
        >
          <option value="">Select Project</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Building */}
        <select
          className="form-control"
          value={form.buildingId}
          onChange={(e) =>
            setForm({
              ...form,
              buildingId: e.target.value,
              wingId: "",
              unitId: "",
            })
          }
          disabled={!form.projectId}
        >
          <option value="">Select Building</option>
          {buildings.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Wing */}
        <select
          className="form-control"
          value={form.wingId}
          onChange={(e) =>
            setForm({
              ...form,
              wingId: e.target.value,
              unitId: "",
            })
          }
          disabled={!form.buildingId}
        >
          <option value="">Select Wing</option>
          {wings.map((w: any) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* Flat / Plot */}
        <select
          className="form-control"
          value={form.unitId}
          onChange={(e) => handleChange("unitId", e.target.value)}
          disabled={!form.wingId}
        >
          <option value="">Select Unit</option>

          {units.map((u: any) => (
            <option key={u.id} value={u.id}>
              Flat {u.unitNumber} · {u.areaSqFt} sqft
            </option>
          ))}
        </select>

        {/* Customer Info */}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        {/* Payment */}
        <h5 className="section-title">Builder Cost</h5>
        <label>Built-up Sqft</label>
        <input
          type="number"
          placeholder="Built-up Sqft"
          value={form.builtUpSqft}
          onChange={(e) => handleChange("builtUpSqft", +e.target.value)}
        />
        <label>Rate / Sqft</label>
        <input
          type="number"
          placeholder="Market Rate / Sqft"
          value={form.marketRate}
          onChange={(e) => handleChange("marketRate", +e.target.value)}
        />

        <div className="calc-box">
          Built-up Value: ₹{form.builtUpSqft * form.marketRate}
        </div>
        <label>GST Amount</label>
        <input
          type="number"
          placeholder="GST Amount"
          value={form.gstAmount}
          onChange={(e) => handleChange("gstAmount", +e.target.value)}
        />
        <label>Maintenance Fee</label>
        <input
          type="number"
          placeholder="Maintenance Fee"
          value={form.maintenanceFee}
          onChange={(e) => handleChange("maintenanceFee", +e.target.value)}
        />
        <label>Advocate Fee</label>
        <input
          type="number"
          placeholder="Advocate Fee"
          value={form.advocateFee}
          onChange={(e) => handleChange("advocateFee", +e.target.value)}
        />
        <label>MECB Fee</label>
        <input
          type="number"
          placeholder="MECB Fee"
          value={form.mecbFee}
          onChange={(e) => handleChange("mecbFee", +e.target.value)}
        />
        <label>One Time Maintenance</label>
        <input
          type="number"
          placeholder="One Time Maintenance"
          value={form.oneTimeMaint}
          onChange={(e) => handleChange("oneTimeMaint", +e.target.value)}
        />

        <h5 className="section-title">Government Details</h5>
        <label>One Time Maintenance</label>
        <input
          type="number"
          placeholder="Govt Sq Meter"
          value={form.govtSqMeter}
          onChange={(e) => handleChange("govtSqMeter", +e.target.value)}
        />
        <label>Govt Value</label>
        <input
          type="number"
          placeholder="Govt Value"
          value={form.govtValue}
          onChange={(e) => handleChange("govtValue", +e.target.value)}
        />
        <label>Stamp Duty</label>
        <input
          type="number"
          placeholder="Stamp Duty"
          value={form.stampDuty}
          onChange={(e) => handleChange("stampDuty", +e.target.value)}
        />
        <label>Registration Fee</label>
        <input
          type="number"
          placeholder="Registration Fee"
          value={form.registrationFee}
          onChange={(e) => handleChange("registrationFee", +e.target.value)}
        />

        <button onClick={onClose}>Cancel</button>
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={bookingMutation.isPending}
        >
          {booking
            ? "Update Booking"
            : bookingMutation.isPending
              ? "Booking..."
              : "Book Now"}
        </button>
      </div>
    </div>
  );
}
