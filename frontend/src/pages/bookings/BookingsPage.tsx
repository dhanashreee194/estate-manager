import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  getProjectBookings,
  getAvailableUnits,
  cancelBooking,
} from "../../api/booking";

import { getProjects } from "../../api/project";

import { useDispatch } from "react-redux";
import { setCurrentProjectId } from "../../store/projectSlice";
import { useAppSelector } from "../../store/hooks";

import BookingStats from "./BookingStats";
import BookingTable from "./BookingTable";
import BookingModal from "./BookingModal";
import BookingPaymentModal from "./BookingPaymentModal";

export default function BookingsPage() {
  const { t } = useTranslation();
  const projectId = useAppSelector((s) => s.project.currentProjectId);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Modal states
  const [open, setOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);

  /* ---------------- Projects ---------------- */

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      dispatch(setCurrentProjectId(projects[0].id));
    }
  }, [projects, projectId, dispatch]);

  /* ---------------- Bookings ---------------- */

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", projectId],
    queryFn: () => getProjectBookings(projectId!),
    enabled: !!projectId,
  });

  /* ---------------- Units ---------------- */

  const { data: availableUnits = [] } = useQuery({
    queryKey: ["available-units", projectId],
    queryFn: () => getAvailableUnits(projectId!),
    enabled: !!projectId,
  });

  /* ---------------- Cancel Booking ---------------- */

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,

    onSuccess: () => {
      alert(t("bookings.cancelled"));

      queryClient.invalidateQueries({
        queryKey: ["bookings", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["available-units", projectId],
      });
    },

    onError: (error: any) => {
      console.error("Cancel failed:", error.response?.data || error);
      alert(error.response?.data?.message || t("bookings.cancelFailed"));
    },
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{t("bookings.title")}</h2>

        <button
          className="primary-btn"
          onClick={() => {
            setEditBooking(null); // NEW booking
            setOpen(true);
          }}
        >
          {t("bookings.newBooking")}
        </button>
      </div>

      {/* Project Selector */}

      <select
        value={projectId || ""}
        onChange={(e) => dispatch(setCurrentProjectId(e.target.value))}
      >
        {projects.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Stats */}

      <BookingStats bookings={bookings} availableUnits={availableUnits} />

      {/* Table */}

      <BookingTable
        bookings={bookings}
        onEdit={(booking: any) => {
          setEditBooking(booking);
          setOpen(true);
        }}
        onCancel={(id: string) => {
          if (confirm(t("bookings.cancelBooking"))) {
            cancelMutation.mutate(id);
          }
        }}
        onPayments={(id: string) => setPaymentBookingId(id)}
      />

      {/* Booking Modal */}

      {open && (
        <BookingModal
          booking={editBooking}
          onClose={() => {
            setOpen(false);
            setEditBooking(null);
          }}
          onBookingSuccess={(id: string) => {
            setOpen(false);
            setPaymentBookingId(id);
          }}
        />
      )}

      {/* Payment Modal */}

      {paymentBookingId && (
        <BookingPaymentModal
          bookingId={paymentBookingId}
          onClose={() => setPaymentBookingId(null)}
        />
      )}
    </div>
  );
}
