import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  createBooking,
  updateBooking,
} from "../../api/booking";
import { getProjects } from "../../api/project";
import { getWingsByBuilding } from "../../api/wing";
import { getProjectBuildings } from "../../api/building";
import "./bookings.css";
import { getUnitsByWing } from "../../api/unit";
import { getBrokers } from "../../api/broker";

export default function BookingModal({
  onClose,
  booking,
  onBookingSuccess,
}: any) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    projectId: "",
    buildingId: "",
    wingId: "",
    unitId: "",
    brokerId: "",
    commissionRate: "" as number | "",

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
      brokerId: booking.brokerId || booking.broker?.id || "",
      commissionRate: booking.commission?.rate ?? "",

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

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: brokers = [] } = useQuery({
    queryKey: ["brokers"],
    queryFn: () => getBrokers(),
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

  const selectedBroker = brokers.find((b: any) => b.id === form.brokerId);
  const effectiveRate =
    form.commissionRate !== ""
      ? Number(form.commissionRate)
      : selectedBroker?.commissionRate ?? 0;

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
        onBookingSuccess(data.id);
      } else {
        onClose();
      }
    },
  });

  const handleSubmit = () => {
    if (!form.unitId || !form.name || !form.phone) {
      alert(t("bookings.fillRequired"));
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

      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,

      brokerId: form.brokerId || undefined,
      ...(form.commissionRate !== ""
        ? { commissionRate: Number(form.commissionRate) }
        : {}),

      builtUpSqft: form.builtUpSqft,
      marketRate: form.marketRate,

      gstAmount: form.gstAmount,
      maintenanceFee: form.maintenanceFee,
      advocateFee: form.advocateFee,
      mecbFee: form.mecbFee,
      oneTimeMaint: form.oneTimeMaint,

      govtSqMeter: form.govtSqMeter,
      govtValue: form.govtValue,
      stampDuty: form.stampDuty,
      registrationFee: form.registrationFee,

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

  const builtUpValue = form.builtUpSqft * form.marketRate;
  const estCommission =
    (builtUpValue +
      form.gstAmount +
      form.maintenanceFee +
      form.advocateFee +
      form.mecbFee +
      form.oneTimeMaint +
      form.govtValue +
      form.stampDuty +
      form.registrationFee) *
    (effectiveRate / 100);

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h4>
          {booking ? t("bookings.editBooking") : t("bookings.newBookingTitle")}
        </h4>

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
          <option value="">{t("common.selectProject")}</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

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
          <option value="">{t("bookings.selectBuilding")}</option>
          {buildings.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

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
          <option value="">{t("bookings.selectWing")}</option>
          {wings.map((w: any) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={form.unitId}
          onChange={(e) => handleChange("unitId", e.target.value)}
          disabled={!form.wingId}
        >
          <option value="">{t("bookings.selectUnit")}</option>

          {units.map((u: any) => (
            <option key={u.id} value={u.id}>
              {t("bookings.unitFlatOption", {
                number: u.unitNumber,
                area: u.areaSqFt,
              })}
            </option>
          ))}
        </select>

        <input
          placeholder={t("common.name")}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <input
          placeholder={t("common.phone")}
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />

        <input
          placeholder={t("common.email")}
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <h5 className="section-title">{t("bookings.channelPartner")}</h5>
        <select
          className="form-control"
          value={form.brokerId}
          onChange={(e) => {
            const brokerId = e.target.value;
            const broker = brokers.find((b: any) => b.id === brokerId);
            setForm({
              ...form,
              brokerId,
              commissionRate: broker ? broker.commissionRate : "",
            });
          }}
        >
          <option value="">{t("bookings.noBroker")}</option>
          {brokers.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name} · {b.commissionRate}%
            </option>
          ))}
        </select>
        {form.brokerId && (
          <>
            <label>{t("bookings.commissionOverride")}</label>
            <input
              type="number"
              step="0.1"
              value={form.commissionRate}
              onChange={(e) =>
                handleChange(
                  "commissionRate",
                  e.target.value === "" ? "" : +e.target.value,
                )
              }
            />
            <div className="calc-box">
              {t("bookings.estCommission", { rate: effectiveRate })}: ₹
              {estCommission.toLocaleString("en-IN")}
            </div>
          </>
        )}

        <h5 className="section-title">{t("bookings.builderCost")}</h5>
        <label>{t("bookings.builtUpSqft")}</label>
        <input
          type="number"
          placeholder={t("bookings.builtUpSqft")}
          value={form.builtUpSqft}
          onChange={(e) => handleChange("builtUpSqft", +e.target.value)}
        />
        <label>{t("bookings.rateSqft")}</label>
        <input
          type="number"
          placeholder={t("bookings.marketRate")}
          value={form.marketRate}
          onChange={(e) => handleChange("marketRate", +e.target.value)}
        />

        <div className="calc-box">
          {t("bookings.builtUpValue")}: ₹{builtUpValue}
        </div>
        <label>{t("bookings.gstAmount")}</label>
        <input
          type="number"
          placeholder={t("bookings.gstAmount")}
          value={form.gstAmount}
          onChange={(e) => handleChange("gstAmount", +e.target.value)}
        />
        <label>{t("bookings.maintenanceFee")}</label>
        <input
          type="number"
          placeholder={t("bookings.maintenanceFee")}
          value={form.maintenanceFee}
          onChange={(e) => handleChange("maintenanceFee", +e.target.value)}
        />
        <label>{t("bookings.advocateFee")}</label>
        <input
          type="number"
          placeholder={t("bookings.advocateFee")}
          value={form.advocateFee}
          onChange={(e) => handleChange("advocateFee", +e.target.value)}
        />
        <label>{t("bookings.mecbFee")}</label>
        <input
          type="number"
          placeholder={t("bookings.mecbFee")}
          value={form.mecbFee}
          onChange={(e) => handleChange("mecbFee", +e.target.value)}
        />
        <label>{t("bookings.oneTimeMaint")}</label>
        <input
          type="number"
          placeholder={t("bookings.oneTimeMaint")}
          value={form.oneTimeMaint}
          onChange={(e) => handleChange("oneTimeMaint", +e.target.value)}
        />

        <h5 className="section-title">{t("bookings.govtDetails")}</h5>
        <label>{t("bookings.govtSqMeter")}</label>
        <input
          type="number"
          placeholder={t("bookings.govtSqMeter")}
          value={form.govtSqMeter}
          onChange={(e) => handleChange("govtSqMeter", +e.target.value)}
        />
        <label>{t("bookings.govtValue")}</label>
        <input
          type="number"
          placeholder={t("bookings.govtValue")}
          value={form.govtValue}
          onChange={(e) => handleChange("govtValue", +e.target.value)}
        />
        <label>{t("bookings.stampDuty")}</label>
        <input
          type="number"
          placeholder={t("bookings.stampDuty")}
          value={form.stampDuty}
          onChange={(e) => handleChange("stampDuty", +e.target.value)}
        />
        <label>{t("bookings.registrationFee")}</label>
        <input
          type="number"
          placeholder={t("bookings.registrationFee")}
          value={form.registrationFee}
          onChange={(e) => handleChange("registrationFee", +e.target.value)}
        />

        <button onClick={onClose}>{t("common.cancel")}</button>
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={bookingMutation.isPending}
        >
          {booking
            ? t("bookings.updateBooking")
            : bookingMutation.isPending
              ? t("bookings.bookingInProgress")
              : t("bookings.bookNow")}
        </button>
      </div>
    </div>
  );
}
