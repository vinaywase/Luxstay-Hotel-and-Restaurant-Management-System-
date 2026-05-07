import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hoteldb", "root", "Marvind@123");
            Statement stmt = conn.createStatement();
            
            System.out.println("Checking event_bookings table columns...");
            ResultSet rs = stmt.executeQuery("SHOW COLUMNS FROM event_bookings");
            boolean hasRefundStatus = false;
            while(rs.next()) {
                String col = rs.getString("Field");
                System.out.println("- " + col);
                if (col.equals("refund_status")) hasRefundStatus = true;
            }
            
            System.out.println("\nHas refund_status column? " + hasRefundStatus);
            
            System.out.println("\nChecking if event_refunds table exists...");
            ResultSet rs2 = stmt.executeQuery("SHOW TABLES LIKE 'event_refunds'");
            if(rs2.next()) {
                System.out.println("Yes!");
            } else {
                System.out.println("No!");
            }
            
            conn.close();
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
