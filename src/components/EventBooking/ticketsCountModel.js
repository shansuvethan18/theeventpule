import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from 'pages/supabaseClient';
import MDBox from 'components/MDBox';

export default function TicketsCountModel({ open, handleClose, eventId, venueId, eventName, eventDate, eventTime, venueName, fullPrice, halfPrice }) {
    const navigate = useNavigate();
    const [venueData, setVenueData] = useState([]);
    const [selectedZoneId, setSelectedZoneId] = useState(null);

    const fetchVenue = async () => {
        try {
            const { data, error } = await supabase
                .from('venues')
                .select('*, zones_events (*)')
                .eq('id', venueId)
            if (data) {
                setVenueData(data);
            }
            if (error) {
                console.log(error);
            }
        }
        catch (error) {
            console.log('Error in fetching venue', error)
        }
    }

    useEffect(() => {
        fetchVenue();
    }, [])

    const fullTicketPrice = selectedZoneId && (venueData[0]?.zones_events?.filter(zone => zone.id === selectedZoneId).map(zone => zone.price)[0]);
    const halfTicketPrice = selectedZoneId && (venueData[0]?.zones_events?.filter(zone => zone.id === selectedZoneId).map(zone => zone.halfPrice)[0]);
    const zoneName = selectedZoneId && (venueData[0]?.zones_events?.filter(zone => zone.id === selectedZoneId).map(zone => zone.name)[0]);

    const ticketsCount = useFormik({
        initialValues: {
            fullTicketsCount: '',
            halfTicketsCount: '',
        },
        validationSchema: Yup.object({
            fullTicketsCount: Yup.number().required('Required').min(1, 'Must be at least 1'),
            halfTicketsCount: Yup.number().min(0, 'Cannot be less than 0'),
        }),
        onSubmit: (values) => {
            navigate('/eventBookings/book-seats/get-tickets', {
                state: {
                    eventId,
                    venueId,
                    zoneId: selectedZoneId,
                    eventName,
                    eventDate,
                    eventTime,
                    venueName,
                    zoneName: zoneName,
                    fullTicketsCount: values.fullTicketsCount,
                    halfTicketsCount: values.halfTicketsCount,
                    fullTicketPrice,
                    halfTicketPrice,
                }
            });
        },
    });

    return (
        <Dialog open={open} onClose={handleClose}>
            <form onSubmit={ticketsCount.handleSubmit}>
                <DialogTitle>Buy Tickets</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Choose the perfect tickets to suit your needs!
                    </DialogContentText>
                    <MDBox>
                        <Box m={1}>
                            <FormControl fullWidth>
                                <InputLabel>Select Zone</InputLabel>
                                <Select
                                    label="Select Zone"
                                    value={selectedZoneId}
                                    onChange={(e) => setSelectedZoneId(e.target.value)}
                                    sx={{ height: '45px' }}
                                >
                                    {venueData[0]?.zones_events?.map((zone) => (
                                        <MenuItem key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            // autoFocus
                            required
                            margin="dense"
                            id="fullTicketsCount"
                            name="fullTicketsCount"
                            label="Number Of Full Tickets"
                            type="number"
                            fullWidth
                            variant="standard"
                            value={ticketsCount.values.fullTicketsCount}
                            onChange={ticketsCount.handleChange}
                            onBlur={ticketsCount.handleBlur}
                            error={ticketsCount.touched.fullTicketsCount && Boolean(ticketsCount.errors.fullTicketsCount)}
                            helperText={ticketsCount.touched.fullTicketsCount && ticketsCount.errors.fullTicketsCount}
                        />
                        <TextField
                            margin="dense"
                            id="halfTicketsCount"
                            name="halfTicketsCount"
                            label="Number Of Half Tickets"
                            type="number"
                            fullWidth
                            variant="standard"
                            value={ticketsCount.values.halfTicketsCount}
                            onChange={ticketsCount.handleChange}
                            onBlur={ticketsCount.handleBlur}
                            error={ticketsCount.touched.halfTicketsCount && Boolean(ticketsCount.errors.halfTicketsCount)}
                            helperText={ticketsCount.touched.halfTicketsCount && ticketsCount.errors.halfTicketsCount}
                        />
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Continue</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

TicketsCountModel.propTypes = {
    open: PropTypes.isRequired,
    handleClose: PropTypes.isRequired,
    eventId: PropTypes.isRequired,
    venueId: PropTypes.isRequired,
    eventName: PropTypes.isRequired,
    venueName: PropTypes.isRequired,
    eventDate: PropTypes.isRequired,
    eventTime: PropTypes.isRequired,
    fullPrice: PropTypes.isRequired,
    halfPrice: PropTypes.isRequired,
};