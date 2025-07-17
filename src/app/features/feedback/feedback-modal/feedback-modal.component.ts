import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalService } from 'src/app/core/services/modal.service'
import { BasicButtonComponent } from '../../../shared/components/ui/basic-button/basic-button.component'
import { ModalWindowComponent } from '../../../shared/components/ui/modal-window/modal-window.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import html2canvas from 'html2canvas'

@Component({
  selector: 'polo-feedback-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BasicButtonComponent,
    ModalWindowComponent,
  ],
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.sass'],
})
export class FeedbackModalComponent {
  feedbackMessage = ''
  screenshot = ''
  isSubmitting = false

  constructor(
    private modalService: ModalService,
    private db: DatabaseService
  ) {
    this.takeScreenshot()
  }

  private takeScreenshot() {
    html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 0.5,
    })
      .then((canvas: HTMLCanvasElement) => {
        this.screenshot = canvas.toDataURL('image/png')
      })
      .catch((error: any) => {
        console.error('Error taking screenshot:', error)
      })
  }

  cancel() {
    this.modalService.close()
  }

  async submitFeedback() {
    if (!this.feedbackMessage.trim()) {
      return
    }

    this.isSubmitting = true

    try {
      const feedbackData = {
        user_id: this.db.user()?.id || 'anonymous',
        message: this.feedbackMessage,
        screenshot: this.screenshot,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        user_email: this.db.user()?.email || null,
      }

      // Store feedback in Supabase database
      const { error } = await this.db.supabase
        .from('feedback')
        .insert([feedbackData])

      if (error) {
        console.error('Error storing feedback:', error)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to send feedback. Please try again later.')
    } finally {
      this.modalService.close()
      this.isSubmitting = false
    }
  }
}
